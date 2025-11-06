import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('liveness')
  @Public()
  @ApiOperation({ summary: 'Liveness probe - Is the server running? (public)' })
  @ApiResponse({ status: 200, description: 'Server is alive' })
  async getLiveness() {
    return this.healthService.getLiveness();
  }

  @Get('readiness')
  @Public()
  @ApiOperation({ summary: 'Readiness probe - Are all services ready? (public)' })
  @ApiResponse({ status: 200, description: 'All services ready' })
  @ApiResponse({ status: 503, description: 'Some services unavailable' })
  async getReadiness() {
    const health = await this.healthService.getReadiness();
    return health;
  }

  @Get('metrics')
  @Public()
  @ApiOperation({ summary: 'Health metrics - CPU, memory, uptime (public)' })
  @ApiResponse({ status: 200, description: 'Health metrics' })
  async getMetrics() {
    return this.healthService.getMetrics();
  }
}

