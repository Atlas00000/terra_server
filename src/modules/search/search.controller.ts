import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CACHE_TTL } from '../../config/cache.config';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('global')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.SEARCH_RESULTS)
  @ApiOperation({ summary: 'Global search across all entities (public)' })
  @ApiQuery({ name: 'q', required: true, example: 'archer' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Search results from all entities' })
  async globalSearch(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.searchService.globalSearch(query, limit ? parseInt(String(limit)) : 20);
  }

  @Get('inquiries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Advanced inquiry search with filters (admin only)' })
  @ApiQuery({ name: 'q', required: false, example: 'military' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'leadScore' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'statuses', required: false, type: [String] })
  @ApiQuery({ name: 'countries', required: false, type: [String] })
  @ApiQuery({ name: 'minScore', required: false, example: 60 })
  @ApiQuery({ name: 'maxScore', required: false, example: 100 })
  @ApiResponse({ status: 200, description: 'Filtered inquiry results' })
  async searchInquiries(@Query() params: any) {
    const filters = {
      dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
      dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
      statuses: params.statuses ? (Array.isArray(params.statuses) ? params.statuses : [params.statuses]) : undefined,
      countries: params.countries ? (Array.isArray(params.countries) ? params.countries : [params.countries]) : undefined,
      minScore: params.minScore ? parseInt(String(params.minScore)) : undefined,
      maxScore: params.maxScore ? parseInt(String(params.maxScore)) : undefined,
    };

    return this.searchService.searchInquiries(
      params.q,
      filters,
      params.page ? parseInt(String(params.page)) : 1,
      params.limit ? parseInt(String(params.limit)) : 20,
      params.sortBy || 'createdAt',
      params.sortOrder || 'desc',
    );
  }

  @Get('rfqs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Advanced RFQ search with filters (admin only)' })
  @ApiQuery({ name: 'q', required: false, example: 'reconnaissance' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'quoteAmount' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'categories', required: false, type: [String] })
  @ApiQuery({ name: 'statuses', required: false, type: [String] })
  @ApiQuery({ name: 'minAmount', required: false, example: 100000 })
  @ApiQuery({ name: 'maxAmount', required: false, example: 10000000 })
  @ApiResponse({ status: 200, description: 'Filtered RFQ results' })
  async searchRfqs(@Query() params: any) {
    const filters = {
      dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
      dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
      categories: params.categories ? (Array.isArray(params.categories) ? params.categories : [params.categories]) : undefined,
      statuses: params.statuses ? (Array.isArray(params.statuses) ? params.statuses : [params.statuses]) : undefined,
      minAmount: params.minAmount ? parseFloat(String(params.minAmount)) : undefined,
      maxAmount: params.maxAmount ? parseFloat(String(params.maxAmount)) : undefined,
    };

    return this.searchService.searchRfqs(
      params.q,
      filters,
      params.page ? parseInt(String(params.page)) : 1,
      params.limit ? parseInt(String(params.limit)) : 20,
      params.sortBy || 'createdAt',
      params.sortOrder || 'desc',
    );
  }

  @Get('news')
  @Public()
  @ApiOperation({ summary: 'Advanced news search with filters (public)' })
  @ApiQuery({ name: 'q', required: false, example: 'vtol' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'viewCount' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'categories', required: false, type: [String] })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiResponse({ status: 200, description: 'Filtered news results' })
  async searchNews(@Query() params: any) {
    const filters = {
      dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
      dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
      categories: params.categories ? (Array.isArray(params.categories) ? params.categories : [params.categories]) : undefined,
      tags: params.tags ? (Array.isArray(params.tags) ? params.tags : [params.tags]) : undefined,
    };

    return this.searchService.searchNews(
      params.q,
      filters,
      params.page ? parseInt(String(params.page)) : 1,
      params.limit ? parseInt(String(params.limit)) : 20,
      params.sortBy || 'publishedAt',
      params.sortOrder || 'desc',
    );
  }

  @Get('products')
  @Public()
  @ApiOperation({ summary: 'Search product specifications (public)' })
  @ApiQuery({ name: 'q', required: false, example: 'surveillance' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'categories', required: false, type: [String] })
  @ApiResponse({ status: 200, description: 'Filtered product specs results' })
  async searchProducts(@Query() params: any) {
    const filters = {
      categories: params.categories ? (Array.isArray(params.categories) ? params.categories : [params.categories]) : undefined,
    };

    return this.searchService.searchProducts(
      params.q,
      filters,
      params.page ? parseInt(String(params.page)) : 1,
      params.limit ? parseInt(String(params.limit)) : 20,
    );
  }

  @Get('suggestions')
  @Public()
  @ApiOperation({ summary: 'Get search suggestions (auto-complete) (public)' })
  @ApiQuery({ name: 'q', required: true, example: 'arc' })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  @ApiResponse({ status: 200, description: 'Search suggestions' })
  async getSuggestions(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.searchService.getSuggestions(query, limit ? parseInt(String(limit)) : 5);
  }
}

