import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('activity-logs')
@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get activity logs with filtering (admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiResponse({ status: 200, description: 'Activity logs' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.activityLogsService.findAll(
      page || 1,
      limit || 50,
      userId,
      action,
      entityType,
    );
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent activity (last 24 hours) (admin only)' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Recent activity logs' })
  async getRecent(@Query('limit') limit?: number) {
    return this.activityLogsService.getRecentActivity(limit || 20);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get activity statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Activity statistics' })
  async getStats() {
    return this.activityLogsService.getStats();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get logs for specific user (admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, description: 'User activity logs' })
  async findByUser(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.activityLogsService.findByUser(userId, page || 1, limit || 50);
  }
}

