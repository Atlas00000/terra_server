import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateNewsDtoClass } from './dto/create-news.dto';
import { UpdateNewsDtoClass } from './dto/update-news.dto';
import { QueryNewsDtoClass } from './dto/query-news.dto';
import { CACHE_TTL } from '../../config/cache.config';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create news story (admin only - creates as draft)' })
  @ApiResponse({ status: 201, description: 'News story created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async create(@Body() body: any, @CurrentUser() user: any) {
    return this.newsService.create(
      body.title,
      body.content,
      user.id,
      body.excerpt,
      body.featuredImageId,
      body.category,
      body.tags,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all news stories with filtering (admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'archived'] })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'authorId', required: false })
  @ApiResponse({ status: 200, description: 'List of news stories' })
  async findAll(@Query() query: QueryNewsDtoClass) {
    return this.newsService.findAll(
      query.page,
      query.limit,
      query.status,
      query.category,
      query.tag,
      query.authorId,
    );
  }

  @Get('featured')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.NEWS_FEATURED)
  @ApiOperation({ summary: 'Get featured news stories for homepage (public)' })
  @ApiQuery({ name: 'limit', required: false, example: 3 })
  @ApiResponse({ status: 200, description: 'Featured news stories' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.newsService.getFeatured(limit || 3);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get news statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'News statistics' })
  async getStats() {
    return this.newsService.getStats();
  }

  @Get('slug/:slug')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.NEWS_SINGLE)
  @ApiOperation({ summary: 'Get published news story by slug (public)' })
  @ApiParam({ name: 'slug', example: 'terra-industries-launches-archer-vtol' })
  @ApiResponse({ status: 200, description: 'News story details' })
  @ApiResponse({ status: 404, description: 'News story not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get news story by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'News story details' })
  @ApiResponse({ status: 404, description: 'News story not found' })
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update news story (admin only)' })
  @ApiResponse({ status: 200, description: 'News story updated successfully' })
  @ApiResponse({ status: 404, description: 'News story not found' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.newsService.update(
      id,
      body.title,
      body.content,
      body.excerpt,
      body.featuredImageId,
      body.category,
      body.tags,
    );
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish news story (admin only)' })
  @ApiResponse({ status: 200, description: 'News story published successfully' })
  @ApiResponse({ status: 400, description: 'Story is already published' })
  @ApiResponse({ status: 404, description: 'News story not found' })
  async publish(@Param('id') id: string) {
    return this.newsService.publish(id);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish news story (revert to draft) (admin only)' })
  @ApiResponse({ status: 200, description: 'News story unpublished successfully' })
  @ApiResponse({ status: 400, description: 'Story is not published' })
  @ApiResponse({ status: 404, description: 'News story not found' })
  async unpublish(@Param('id') id: string) {
    return this.newsService.unpublish(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete (archive) news story (admin only)' })
  @ApiResponse({ status: 200, description: 'News story archived successfully' })
  @ApiResponse({ status: 404, description: 'News story not found' })
  async remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}

