import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface LogActivityOptions {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create activity log entry
   */
  async log(options: LogActivityOptions) {
    const log = await this.prisma.activityLog.create({
      data: {
        userId: options.userId || null,
        action: options.action,
        entityType: options.entityType || null,
        entityId: options.entityId || null,
        changes: options.changes || {},
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return log;
  }

  /**
   * Get activity logs with pagination and filtering
   */
  async findAll(
    page: number = 1,
    limit: number = 50,
    userId?: string,
    action?: string,
    entityType?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    if (entityType) {
      where.entityType = entityType;
    }

    const total = await this.prisma.activityLog.count({ where });

    const logs = await this.prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get logs for specific user
   */
  async findByUser(userId: string, page: number = 1, limit: number = 50) {
    return this.findAll(page, limit, userId);
  }

  /**
   * Get recent activity (last 24 hours)
   */
  async getRecentActivity(limit: number = 20) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const logs = await this.prisma.activityLog.findMany({
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return logs;
  }

  /**
   * Get activity statistics
   */
  async getStats() {
    const total = await this.prisma.activityLog.count();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await this.prisma.activityLog.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    return {
      total,
      today: todayCount,
    };
  }
}

