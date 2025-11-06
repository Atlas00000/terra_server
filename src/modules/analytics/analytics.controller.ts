import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CACHE_TTL } from '../../config/cache.config';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.ANALYTICS_OVERVIEW)
  @ApiOperation({ summary: 'Get dashboard overview statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard overview data' })
  async getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('conversion-funnel')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.ANALYTICS_FUNNEL)
  @ApiOperation({ summary: 'Get conversion funnel metrics (admin only)' })
  @ApiResponse({ status: 200, description: 'Conversion funnel data' })
  async getConversionFunnel() {
    return this.analyticsService.getConversionFunnel();
  }

  @Get('lead-sources')
  @ApiOperation({ summary: 'Get lead sources breakdown (admin only)' })
  @ApiResponse({ status: 200, description: 'Lead sources analytics' })
  async getLeadSources() {
    return this.analyticsService.getLeadSources();
  }

  @Get('response-times')
  @ApiOperation({ summary: 'Get average response times (admin only)' })
  @ApiResponse({ status: 200, description: 'Response time metrics' })
  async getResponseTimes() {
    return this.analyticsService.getResponseTimes();
  }

  @Get('top-performers')
  @ApiOperation({ summary: 'Get top performers (products, countries, deals) (admin only)' })
  @ApiResponse({ status: 200, description: 'Top performers data' })
  async getTopPerformers() {
    return this.analyticsService.getTopPerformers();
  }

  @Get('timeline/inquiries')
  @ApiOperation({ summary: 'Get inquiries timeline (admin only)' })
  @ApiQuery({ name: 'days', required: false, example: 30, description: 'Number of days' })
  @ApiResponse({ status: 200, description: 'Inquiries timeline data' })
  async getInquiriesTimeline(@Query('days') days?: number) {
    return this.analyticsService.getInquiriesTimeline(days ? parseInt(String(days)) : 30);
  }

  @Get('timeline/rfqs')
  @ApiOperation({ summary: 'Get RFQs timeline (admin only)' })
  @ApiQuery({ name: 'days', required: false, example: 30, description: 'Number of days' })
  @ApiResponse({ status: 200, description: 'RFQs timeline data' })
  async getRfqsTimeline(@Query('days') days?: number) {
    return this.analyticsService.getRfqsTimeline(days ? parseInt(String(days)) : 30);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity across all entities (admin only)' })
  @ApiQuery({ name: 'limit', required: false, example: 20, description: 'Number of activities' })
  @ApiResponse({ status: 200, description: 'Recent activity feed' })
  async getRecentActivity(@Query('limit') limit?: number) {
    return this.analyticsService.getRecentActivity(limit ? parseInt(String(limit)) : 20);
  }

  @Get('active-leads')
  @ApiOperation({ summary: 'Get currently active/hot leads (admin only)' })
  @ApiResponse({ status: 200, description: 'Active leads list' })
  async getActiveLeads() {
    return this.analyticsService.getActiveLeads();
  }

  @Get('pending-actions')
  @ApiOperation({ summary: 'Get items needing attention (admin only)' })
  @ApiResponse({ status: 200, description: 'Pending actions count' })
  async getPendingActions() {
    return this.analyticsService.getPendingActions();
  }

  @Get('products')
  @ApiOperation({ summary: 'Get product performance analytics (admin only)' })
  @ApiResponse({ status: 200, description: 'Product analytics data' })
  async getProductAnalytics() {
    return this.analyticsService.getProductAnalytics();
  }

  @Get('news')
  @ApiOperation({ summary: 'Get news performance analytics (admin only)' })
  @ApiResponse({ status: 200, description: 'News analytics data' })
  async getNewsAnalytics() {
    return this.analyticsService.getNewsAnalytics();
  }
}

