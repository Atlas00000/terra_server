import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get dashboard overview statistics
   */
  async getOverview() {
    const [
      totalInquiries,
      totalRfqs,
      totalQuotes,
      wonDeals,
      totalViews,
      activeLeads,
    ] = await Promise.all([
      this.prisma.inquiry.count(),
      this.prisma.rfqRequest.count(),
      this.prisma.rfqRequest.count({ where: { status: 'quoted' } }),
      this.prisma.rfqRequest.count({ where: { status: 'won' } }),
      this.prisma.newsStory.aggregate({ _sum: { viewCount: true } }),
      this.prisma.inquiry.count({
        where: {
          status: { in: ['new', 'contacted'] },
          leadScore: { gte: 60 },
        },
      }),
    ]);

    // Calculate total pipeline value
    const pipeline = await this.prisma.rfqRequest.aggregate({
      where: { status: { in: ['pending', 'quoted'] } },
      _sum: { quoteAmount: true },
    });

    // Calculate won revenue
    const wonRevenue = await this.prisma.rfqRequest.aggregate({
      where: { status: 'won' },
      _sum: { quoteAmount: true },
    });

    // Calculate conversion rates
    const conversionRate = totalInquiries > 0 ? (totalRfqs / totalInquiries) * 100 : 0;
    const winRate = totalQuotes > 0 ? (wonDeals / totalQuotes) * 100 : 0;

    return {
      inquiries: {
        total: totalInquiries,
        active: activeLeads,
      },
      rfqs: {
        total: totalRfqs,
        quoted: totalQuotes,
        won: wonDeals,
      },
      revenue: {
        pipeline: Number(pipeline._sum.quoteAmount || 0),
        won: Number(wonRevenue._sum.quoteAmount || 0),
      },
      conversionRates: {
        inquiryToRfq: Number(conversionRate.toFixed(2)),
        rfqToWon: Number(winRate.toFixed(2)),
      },
      engagement: {
        totalNewsViews: totalViews._sum.viewCount || 0,
      },
    };
  }

  /**
   * Get conversion funnel metrics
   */
  async getConversionFunnel() {
    const inquiries = await this.prisma.inquiry.count();
    const rfqs = await this.prisma.rfqRequest.count();
    const quoted = await this.prisma.rfqRequest.count({ where: { status: 'quoted' } });
    const won = await this.prisma.rfqRequest.count({ where: { status: 'won' } });

    return {
      stages: [
        { name: 'Inquiries', count: inquiries, percentage: 100 },
        {
          name: 'RFQs',
          count: rfqs,
          percentage: inquiries > 0 ? Number(((rfqs / inquiries) * 100).toFixed(2)) : 0,
        },
        {
          name: 'Quoted',
          count: quoted,
          percentage: inquiries > 0 ? Number(((quoted / inquiries) * 100).toFixed(2)) : 0,
        },
        {
          name: 'Won',
          count: won,
          percentage: inquiries > 0 ? Number(((won / inquiries) * 100).toFixed(2)) : 0,
        },
      ],
      dropOffRates: {
        inquiryToRfq: inquiries > 0 ? Number((((inquiries - rfqs) / inquiries) * 100).toFixed(2)) : 0,
        rfqToQuote: rfqs > 0 ? Number((((rfqs - quoted) / rfqs) * 100).toFixed(2)) : 0,
        quoteToWon: quoted > 0 ? Number((((quoted - won) / quoted) * 100).toFixed(2)) : 0,
      },
    };
  }

  /**
   * Get lead sources breakdown
   */
  async getLeadSources() {
    const byCountry = await this.prisma.inquiry.groupBy({
      by: ['country'],
      _count: true,
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });

    const byType = await this.prisma.inquiry.groupBy({
      by: ['inquiryType'],
      _count: true,
    });

    const byLeadScore = await this.prisma.$queryRaw<Array<{ range: string; count: bigint }>>`
      SELECT 
        CASE 
          WHEN lead_score >= 80 THEN 'Hot (80-100)'
          WHEN lead_score >= 60 THEN 'Warm (60-79)'
          WHEN lead_score >= 40 THEN 'Medium (40-59)'
          ELSE 'Cold (0-39)'
        END as range,
        COUNT(*)::int as count
      FROM inquiries
      GROUP BY range
      ORDER BY MIN(lead_score) DESC
    `;

    return {
      byCountry: byCountry.map((item) => ({
        country: item.country,
        count: item._count,
      })),
      byType: byType.map((item) => ({
        type: item.inquiryType,
        count: item._count,
      })),
      byLeadScore: byLeadScore.map((item) => ({
        range: item.range,
        count: Number(item.count),
      })),
    };
  }

  /**
   * Get average response times
   */
  async getResponseTimes() {
    // Get inquiries with their first RFQ
    const inquiriesWithRfq = await this.prisma.inquiry.findMany({
      where: {
        rfqs: { some: {} },
      },
      include: {
        rfqs: {
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const responseTimes = inquiriesWithRfq
      .filter((inq) => inq.rfqs.length > 0)
      .map((inq) => {
        const responseTime = inq.rfqs[0].createdAt.getTime() - inq.createdAt.getTime();
        return responseTime / (1000 * 60 * 60); // Convert to hours
      });

    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    // Get RFQs with quotes
    const rfqsWithQuotes = await this.prisma.rfqRequest.findMany({
      where: { quoteSentAt: { not: null } },
    });

    const quoteResponseTimes = rfqsWithQuotes.map((rfq) => {
      const responseTime = rfq.quoteSentAt!.getTime() - rfq.createdAt.getTime();
      return responseTime / (1000 * 60 * 60); // Convert to hours
    });

    const avgQuoteTime =
      quoteResponseTimes.length > 0
        ? quoteResponseTimes.reduce((a, b) => a + b, 0) / quoteResponseTimes.length
        : 0;

    return {
      inquiryToRfq: {
        averageHours: Number(avgResponseTime.toFixed(2)),
        count: responseTimes.length,
      },
      rfqToQuote: {
        averageHours: Number(avgQuoteTime.toFixed(2)),
        count: quoteResponseTimes.length,
      },
    };
  }

  /**
   * Get top performers (products, countries, deals)
   */
  async getTopPerformers() {
    // Top products by RFQ count
    const topProducts = await this.prisma.rfqRequest.groupBy({
      by: ['productCategory'],
      _count: true,
      orderBy: { _count: { productCategory: 'desc' } },
      take: 5,
    });

    // Top countries by inquiry count
    const topCountries = await this.prisma.inquiry.groupBy({
      by: ['country'],
      _count: true,
      orderBy: { _count: { country: 'desc' } },
      take: 5,
    });

    // Highest value deals
    const topDeals = await this.prisma.rfqRequest.findMany({
      where: { quoteAmount: { not: null } },
      orderBy: { quoteAmount: 'desc' },
      take: 5,
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
      topProducts: topProducts.map((p) => ({
        product: p.productCategory,
        rfqCount: p._count,
      })),
      topCountries: topCountries.map((c) => ({
        country: c.country,
        inquiryCount: c._count,
      })),
      topDeals: topDeals.map((d) => ({
        id: d.id,
        product: d.productCategory,
        amount: Number(d.quoteAmount),
        status: d.status,
        customer: d.inquiry?.company || d.inquiry?.fullName || 'N/A',
        country: d.inquiry?.country || 'N/A',
      })),
    };
  }

  /**
   * Get timeline data for inquiries
   */
  async getInquiriesTimeline(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const inquiries = await this.prisma.$queryRaw<
      Array<{ date: Date; count: bigint }>
    >`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as count
      FROM inquiries
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return inquiries.map((item) => ({
      date: item.date.toISOString().split('T')[0],
      count: Number(item.count),
    }));
  }

  /**
   * Get timeline data for RFQs
   */
  async getRfqsTimeline(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rfqs = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as count
      FROM rfq_requests
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return rfqs.map((item) => ({
      date: item.date.toISOString().split('T')[0],
      count: Number(item.count),
    }));
  }

  /**
   * Get recent activity across all entities
   */
  async getRecentActivity(limit: number = 20) {
    const activities = await this.prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
    });

    return activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      user: activity.user?.email || 'System',
      timestamp: activity.createdAt,
    }));
  }

  /**
   * Get active/hot leads
   */
  async getActiveLeads() {
    const leads = await this.prisma.inquiry.findMany({
      where: {
        status: { in: ['new', 'contacted'] },
        leadScore: { gte: 60 },
      },
      orderBy: { leadScore: 'desc' },
      take: 10,
      include: {
        rfqs: {
          select: { id: true, status: true },
        },
      },
    });

    return leads.map((lead) => ({
      id: lead.id,
      fullName: lead.fullName,
      company: lead.company,
      country: lead.country,
      leadScore: lead.leadScore,
      status: lead.status,
      hasRfq: lead.rfqs.length > 0,
      createdAt: lead.createdAt,
    }));
  }

  /**
   * Get pending actions (items needing attention)
   */
  async getPendingActions() {
    const unansweredInquiries = await this.prisma.inquiry.count({
      where: { status: 'new' },
    });

    const pendingRfqs = await this.prisma.rfqRequest.count({
      where: { status: 'pending' },
    });

    const pendingEmails = await this.prisma.emailQueue.count({
      where: { status: 'pending' },
    });

    const failedEmails = await this.prisma.emailQueue.count({
      where: { status: 'failed', attempts: { gte: 3 } },
    });

    return {
      unansweredInquiries,
      pendingRfqs,
      pendingEmails,
      failedEmails,
      total: unansweredInquiries + pendingRfqs + pendingEmails + failedEmails,
    };
  }

  /**
   * Get product performance analytics
   */
  async getProductAnalytics() {
    const rfqsByProduct = await this.prisma.rfqRequest.groupBy({
      by: ['productCategory'],
      _count: true,
      _avg: { quoteAmount: true },
    });

    const wonByProduct = await this.prisma.rfqRequest.groupBy({
      by: ['productCategory'],
      where: { status: 'won' },
      _count: true,
      _sum: { quoteAmount: true },
    });

    const products = ['duma', 'archer', 'artemis', 'kallon', 'iroko'];

    return products.map((product) => {
      const rfqData = rfqsByProduct.find((p) => p.productCategory === product);
      const wonData = wonByProduct.find((p) => p.productCategory === product);

      return {
        product,
        totalRfqs: rfqData?._count || 0,
        avgQuoteAmount: rfqData?._avg.quoteAmount ? Number(rfqData._avg.quoteAmount) : 0,
        wonDeals: wonData?._count || 0,
        wonRevenue: wonData?._sum.quoteAmount ? Number(wonData._sum.quoteAmount) : 0,
        conversionRate:
          rfqData?._count && wonData?._count
            ? Number(((wonData._count / rfqData._count) * 100).toFixed(2))
            : 0,
      };
    });
  }

  /**
   * Get news performance analytics
   */
  async getNewsAnalytics() {
    const totalStories = await this.prisma.newsStory.count();
    const published = await this.prisma.newsStory.count({ where: { status: 'published' } });

    const totalViews = await this.prisma.newsStory.aggregate({
      _sum: { viewCount: true },
    });

    const topStories = await this.prisma.newsStory.findMany({
      where: { status: 'published' },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        publishedAt: true,
      },
    });

    return {
      total: totalStories,
      published,
      totalViews: totalViews._sum.viewCount || 0,
      avgViewsPerStory: published > 0 ? Math.round((totalViews._sum.viewCount || 0) / published) : 0,
      topStories,
    };
  }
}

