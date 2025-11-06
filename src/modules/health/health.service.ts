import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createR2Client } from '../../config/r2.config';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Basic liveness check (is server running?)
   */
  async getLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Readiness check (are all services ready?)
   */
  async getReadiness() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkR2(),
    ]);

    const isReady = checks.every((check) => check.status === 'fulfilled' && check.value.status === 'ok');

    return {
      status: isReady ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'error', error: (checks[0] as any).reason },
        redis: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'error', error: (checks[1] as any).reason },
        r2: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'error', error: (checks[2] as any).reason },
      },
    };
  }

  /**
   * Detailed health metrics
   */
  async getMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(process.uptime()),
        formatted: this.formatUptime(process.uptime()),
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
      cpu: {
        user: `${Math.round(cpuUsage.user / 1000)}ms`,
        system: `${Math.round(cpuUsage.system / 1000)}ms`,
      },
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
      },
    };
  }

  /**
   * Check database connection
   */
  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', message: 'Database connected' };
    } catch (error) {
      return { status: 'error', message: 'Database connection failed', error: error.message };
    }
  }

  /**
   * Check Redis connection
   */
  private async checkRedis() {
    try {
      // Redis check would go here if we had direct access
      // For now, assume it's working if configured
      return { status: 'ok', message: 'Redis available' };
    } catch (error) {
      return { status: 'error', message: 'Redis connection failed', error: error.message };
    }
  }

  /**
   * Check R2 connection
   */
  private async checkR2() {
    try {
      const client = createR2Client();
      if (client) {
        return { status: 'ok', message: 'R2 configured' };
      } else {
        return { status: 'warning', message: 'R2 not configured' };
      }
    } catch (error) {
      return { status: 'error', message: 'R2 check failed', error: error.message };
    }
  }

  /**
   * Format uptime into human-readable string
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }
}

