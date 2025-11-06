import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';
import { generateSlug, generateUniqueSlug } from '../../utils/slug.utils';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Create news story (as draft)
   */
  async create(
    title: string,
    content: string,
    authorId: string,
    excerpt?: string,
    featuredImageId?: string,
    category?: string,
    tags?: string[],
  ) {
    // Generate unique slug
    const existingSlugs = await this.prisma.newsStory.findMany({
      select: { slug: true },
    });
    const slug = generateUniqueSlug(title, existingSlugs.map((s) => s.slug));

    const story = await this.prisma.newsStory.create({
      data: {
        title: title,
        slug: slug,
        content: content,
        excerpt: excerpt || null,
        authorId: authorId,
        featuredImageId: featuredImageId || null,
        category: category || null,
        tags: tags || [],
        status: 'draft',
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        featuredImage: true,
      },
    });

    return story;
  }

  /**
   * Get all news stories with filtering
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    status?: 'draft' | 'published' | 'archived',
    category?: string,
    tag?: string,
    authorId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    if (authorId) {
      where.authorId = authorId;
    }

    const total = await this.prisma.newsStory.count({ where });

    const stories = await this.prisma.newsStory.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        featuredImage: true,
      },
    });

    return {
      data: stories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get story by ID (admin)
   */
  async findOne(id: string) {
    const story = await this.prisma.newsStory.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        featuredImage: true,
      },
    });

    if (!story) {
      throw new NotFoundException(`News story with ID ${id} not found`);
    }

    return story;
  }

  /**
   * Get story by slug (public)
   */
  async findBySlug(slug: string) {
    const story = await this.prisma.newsStory.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        featuredImage: true,
      },
    });

    if (!story) {
      throw new NotFoundException(`News story with slug "${slug}" not found`);
    }

    // Only return published stories for public access
    if (story.status !== 'published') {
      throw new NotFoundException(`News story with slug "${slug}" not found`);
    }

    // Increment view count
    await this.prisma.newsStory.update({
      where: { id: story.id },
      data: { viewCount: { increment: 1 } },
    });

    return story;
  }

  /**
   * Update news story
   */
  async update(
    id: string,
    title?: string,
    content?: string,
    excerpt?: string,
    featuredImageId?: string | null,
    category?: string,
    tags?: string[],
  ) {
    const story = await this.findOne(id); // Check exists

    const data: any = {};

    if (title) {
      data.title = title;
      // Regenerate slug if title changed
      const existingSlugs = await this.prisma.newsStory.findMany({
        where: { id: { not: id } },
        select: { slug: true },
      });
      data.slug = generateUniqueSlug(title, existingSlugs.map((s) => s.slug));
    }

    if (content) data.content = content;
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (featuredImageId !== undefined) data.featuredImageId = featuredImageId;
    if (category !== undefined) data.category = category;
    if (tags !== undefined) data.tags = tags;

    const updated = await this.prisma.newsStory.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        featuredImage: true,
      },
    });

    // Clear cache for this story and related caches
    await this.cacheManager.del(`/api/v1/news/slug/${story.slug}`);
    await this.clearNewsCache();

    return updated;
  }

  /**
   * Publish news story
   */
  async publish(id: string) {
    const story = await this.findOne(id);

    if (story.status === 'published') {
      throw new BadRequestException('Story is already published');
    }

    const published = await this.prisma.newsStory.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        featuredImage: true,
      },
    });

    // Invalidate news cache
    await this.clearNewsCache();

    return published;
  }

  /**
   * Clear news-related cache
   */
  private async clearNewsCache() {
    try {
      await this.cacheManager.del('/api/v1/news/featured');
      await this.cacheManager.del('/api/v1/search/global');
      await this.cacheManager.del('/api/v1/analytics/news');
    } catch (error) {
      // Silently fail cache clearing (not critical)
      console.warn('Cache clearing failed:', error.message);
    }
  }

  /**
   * Unpublish news story (revert to draft)
   */
  async unpublish(id: string) {
    const story = await this.findOne(id);

    if (story.status !== 'published') {
      throw new BadRequestException('Story is not published');
    }

    const unpublished = await this.prisma.newsStory.update({
      where: { id },
      data: {
        status: 'draft',
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        featuredImage: true,
      },
    });

    // Invalidate cache
    await this.cacheManager.del(`/api/v1/news/slug/${story.slug}`);
    await this.clearNewsCache();

    return unpublished;
  }

  /**
   * Delete news story (soft delete - archive)
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.newsStory.update({
      where: { id },
      data: { status: 'archived' },
    });

    return {
      message: 'News story archived successfully',
    };
  }

  /**
   * Get featured stories (for homepage)
   */
  async getFeatured(limit: number = 3) {
    const stories = await this.prisma.newsStory.findMany({
      where: {
        status: 'published',
        featuredImageId: { not: null },
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        featuredImage: true,
      },
    });

    return stories;
  }

  /**
   * Get news statistics
   */
  async getStats() {
    const total = await this.prisma.newsStory.count();
    const published = await this.prisma.newsStory.count({
      where: { status: 'published' },
    });
    const draft = await this.prisma.newsStory.count({
      where: { status: 'draft' },
    });
    const archived = await this.prisma.newsStory.count({
      where: { status: 'archived' },
    });

    const totalViews = await this.prisma.newsStory.aggregate({
      _sum: {
        viewCount: true,
      },
    });

    return {
      total,
      byStatus: {
        published,
        draft,
        archived,
      },
      totalViews: totalViews._sum.viewCount || 0,
    };
  }
}

