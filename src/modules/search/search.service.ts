import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SearchFilters {
  dateFrom?: Date;
  dateTo?: Date;
  categories?: string[];
  tags?: string[];
  statuses?: string[];
  countries?: string[];
  minScore?: number;
  maxScore?: number;
  minAmount?: number;
  maxAmount?: number;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Global search across all entities
   */
  async globalSearch(query: string, limit: number = 20) {
    if (!query || query.trim().length < 2) {
      return {
        inquiries: [],
        rfqs: [],
        news: [],
        products: [],
        total: 0,
      };
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    // Search inquiries
    const inquiries = await this.prisma.inquiry.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
          { message: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: Math.floor(limit / 4),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        company: true,
        inquiryType: true,
        leadScore: true,
        createdAt: true,
      },
    });

    // Search RFQs
    const rfqs = await this.prisma.rfqRequest.findMany({
      where: {
        OR: [
          { productCategory: { contains: query, mode: 'insensitive' } },
          { requirements: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: Math.floor(limit / 4),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        productCategory: true,
        status: true,
        quoteAmount: true,
        createdAt: true,
      },
    });

    // Search news
    const news = await this.prisma.newsStory.findMany({
      where: {
        status: 'published',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: Math.floor(limit / 4),
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
      },
    });

    // Search product specs
    const products = await this.prisma.productSpecification.findMany({
      where: {
        OR: [
          { productName: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: Math.floor(limit / 4),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        productName: true,
        category: true,
        createdAt: true,
      },
    });

    return {
      inquiries,
      rfqs: rfqs.map((r) => ({ ...r, quoteAmount: r.quoteAmount ? Number(r.quoteAmount) : null })),
      news,
      products,
      total: inquiries.length + rfqs.length + news.length + products.length,
    };
  }

  /**
   * Advanced inquiry search with filters
   */
  async searchInquiries(
    query?: string,
    filters?: SearchFilters,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Text search
    if (query && query.trim().length >= 2) {
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
        { message: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Date range filter
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    // Status filter
    if (filters?.statuses && filters.statuses.length > 0) {
      where.status = { in: filters.statuses };
    }

    // Country filter
    if (filters?.countries && filters.countries.length > 0) {
      where.country = { in: filters.countries };
    }

    // Lead score range
    if (filters?.minScore !== undefined || filters?.maxScore !== undefined) {
      where.leadScore = {};
      if (filters.minScore !== undefined) where.leadScore.gte = filters.minScore;
      if (filters.maxScore !== undefined) where.leadScore.lte = filters.maxScore;
    }

    const total = await this.prisma.inquiry.count({ where });

    const inquiries = await this.prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        rfqs: {
          select: { id: true, status: true },
        },
      },
    });

    return {
      data: inquiries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Advanced RFQ search with filters
   */
  async searchRfqs(
    query?: string,
    filters?: SearchFilters,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Text search
    if (query && query.trim().length >= 2) {
      where.OR = [
        { productCategory: { contains: query, mode: 'insensitive' } },
        { requirements: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Date range
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    // Status filter
    if (filters?.statuses && filters.statuses.length > 0) {
      where.status = { in: filters.statuses };
    }

    // Categories (products)
    if (filters?.categories && filters.categories.length > 0) {
      where.productCategory = { in: filters.categories };
    }

    // Quote amount range
    if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
      where.quoteAmount = {};
      if (filters.minAmount !== undefined) where.quoteAmount.gte = filters.minAmount;
      if (filters.maxAmount !== undefined) where.quoteAmount.lte = filters.maxAmount;
    }

    const total = await this.prisma.rfqRequest.count({ where });

    const rfqs = await this.prisma.rfqRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        inquiry: {
          select: {
            fullName: true,
            company: true,
            country: true,
          },
        },
      },
    });

    return {
      data: rfqs.map((r) => ({
        ...r,
        quoteAmount: r.quoteAmount ? Number(r.quoteAmount) : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Advanced news search with filters
   */
  async searchNews(
    query?: string,
    filters?: SearchFilters,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'publishedAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;
    const where: any = { status: 'published' }; // Only published for public

    // Text search
    if (query && query.trim().length >= 2) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Date range
    if (filters?.dateFrom || filters?.dateTo) {
      where.publishedAt = {};
      if (filters.dateFrom) where.publishedAt.gte = filters.dateFrom;
      if (filters.dateTo) where.publishedAt.lte = filters.dateTo;
    }

    // Category filter
    if (filters?.categories && filters.categories.length > 0) {
      where.category = { in: filters.categories };
    }

    // Tag filter
    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    const total = await this.prisma.newsStory.count({ where });

    const news = await this.prisma.newsStory.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        author: {
          select: {
            fullName: true,
          },
        },
        featuredImage: {
          select: {
            publicUrl: true,
            altText: true,
          },
        },
      },
    });

    return {
      data: news,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Product specifications search
   */
  async searchProducts(
    query?: string,
    filters?: SearchFilters,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Text search
    if (query && query.trim().length >= 2) {
      where.OR = [
        { productName: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (filters?.categories && filters.categories.length > 0) {
      where.category = { in: filters.categories };
    }

    const total = await this.prisma.productSpecification.count({ where });

    const products = await this.prisma.productSpecification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get search suggestions (auto-complete)
   */
  async getSuggestions(query: string, limit: number = 5) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = `${query.toLowerCase()}%`;

    // Get suggestions from various sources
    const [companies, products, newsTitles] = await Promise.all([
      this.prisma.inquiry.findMany({
        where: {
          company: { startsWith: query, mode: 'insensitive' },
        },
        select: { company: true },
        distinct: ['company'],
        take: limit,
      }),
      this.prisma.productSpecification.findMany({
        where: {
          productName: { startsWith: query, mode: 'insensitive' },
        },
        select: { productName: true },
        take: limit,
      }),
      this.prisma.newsStory.findMany({
        where: {
          status: 'published',
          title: { startsWith: query, mode: 'insensitive' },
        },
        select: { title: true },
        take: limit,
      }),
    ]);

    const suggestions = [
      ...companies.map((c) => ({ text: c.company, type: 'company' })),
      ...products.map((p) => ({ text: p.productName, type: 'product' })),
      ...newsTitles.map((n) => ({ text: n.title, type: 'news' })),
    ];

    return suggestions.slice(0, limit);
  }
}

