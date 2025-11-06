import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRfqDto, CreateRfqSchema } from './dto/create-rfq.dto';
import { UpdateRfqDto, UpdateRfqSchema } from './dto/update-rfq.dto';
import { QueryRfqDto, QueryRfqSchema } from './dto/query-rfq.dto';
import { SendQuoteDto, SendQuoteSchema } from './dto/send-quote.dto';
import { RfqWorkflowService } from './services/rfq-workflow.service';
import { EmailService } from '../email/email.service';
import { rfqReceivedTemplate } from '../email/templates/rfq-received.template';
import { quoteSentTemplate } from '../email/templates/quote-sent.template';

@Injectable()
export class RfqService {
  constructor(
    private prisma: PrismaService,
    private workflowService: RfqWorkflowService,
    private emailService: EmailService,
  ) {}

  /**
   * Create new RFQ
   */
  async create(dto: CreateRfqDto) {
    // Validate input
    const validated = CreateRfqSchema.safeParse(dto);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }

    // If linked to inquiry, verify it exists
    if (dto.inquiryId) {
      const inquiry = await this.prisma.inquiry.findUnique({
        where: { id: dto.inquiryId },
      });
      if (!inquiry) {
        throw new BadRequestException('Linked inquiry not found');
      }
    }

    // Create RFQ
    const rfq = await this.prisma.rfqRequest.create({
      data: {
        inquiryId: dto.inquiryId || null,
        productCategory: dto.productCategory,
        quantity: dto.quantity || null,
        budgetRange: dto.budgetRange || null,
        timeline: dto.timeline || null,
        requirements: dto.requirements || null,
        specifications: dto.specifications || {},
        status: 'pending',
      },
      include: {
        inquiry: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
            leadScore: true,
          },
        },
      },
    });

    // Queue RFQ confirmation email if linked to inquiry
    if (rfq.inquiry) {
      const rfqTemplate = rfqReceivedTemplate({
        fullName: rfq.inquiry.fullName,
        productCategory: rfq.productCategory,
        quantity: rfq.quantity || undefined,
        rfqId: rfq.id,
      });

      await this.emailService.queueEmail({
        to: rfq.inquiry.email,
        subject: rfqTemplate.subject,
        html: rfqTemplate.html,
        text: rfqTemplate.text,
        templateName: 'rfq_received',
        templateData: { rfqId: rfq.id },
      });
    }

    return rfq;
  }

  /**
   * Find all RFQs with pagination and filtering
   */
  async findAll(query: QueryRfqDto) {
    // Validate query params
    const validated = QueryRfqSchema.safeParse(query);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }

    const { page, limit, status, productCategory, sortBy, order } = validated.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (productCategory) {
      where.productCategory = productCategory;
    }

    // Get total count
    const total = await this.prisma.rfqRequest.count({ where });

    // Get RFQs
    const rfqs = await this.prisma.rfqRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
      include: {
        inquiry: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
            country: true,
            leadScore: true,
          },
        },
      },
    });

    return {
      data: rfqs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one RFQ by ID
   */
  async findOne(id: string) {
    const rfq = await this.prisma.rfqRequest.findUnique({
      where: { id },
      include: {
        inquiry: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            company: true,
            country: true,
            message: true,
            leadScore: true,
          },
        },
      },
    });

    if (!rfq) {
      throw new NotFoundException(`RFQ with ID ${id} not found`);
    }

    return rfq;
  }

  /**
   * Update RFQ
   */
  async update(id: string, dto: UpdateRfqDto) {
    // Validate input
    const validated = UpdateRfqSchema.safeParse(dto);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }

    // Check if RFQ exists
    const existingRfq = await this.findOne(id);

    // Validate status transition
    if (dto.status && dto.status !== existingRfq.status) {
      this.workflowService.ensureValidTransition(existingRfq.status, dto.status);
    }

    // Update RFQ
    const rfq = await this.prisma.rfqRequest.update({
      where: { id },
      data: {
        status: dto.status,
        quoteAmount: dto.quoteAmount,
        decisionDate: dto.decisionDate ? new Date(dto.decisionDate) : undefined,
        notes: dto.notes,
        specifications: dto.specifications,
        updatedAt: new Date(),
      },
      include: {
        inquiry: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
          },
        },
      },
    });

    return rfq;
  }

  /**
   * Send quote to customer
   */
  async sendQuote(id: string, dto: SendQuoteDto) {
    // Validate input
    const validated = SendQuoteSchema.safeParse(dto);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }

    // Check if RFQ exists
    const existingRfq = await this.findOne(id);

    // Validate status transition (can only quote from pending)
    this.workflowService.ensureValidTransition(existingRfq.status, 'quoted');

    // Update RFQ with quote details
    const rfq = await this.prisma.rfqRequest.update({
      where: { id },
      data: {
        status: 'quoted',
        quoteAmount: dto.quoteAmount,
        quoteSentAt: new Date(),
        notes: dto.notes,
        specifications: dto.specifications,
        updatedAt: new Date(),
      },
      include: {
        inquiry: true,
      },
    });

    // Send quote email to customer
    if (rfq.inquiry) {
      const quoteTemplate = quoteSentTemplate({
        fullName: rfq.inquiry.fullName,
        productCategory: rfq.productCategory,
        quantity: rfq.quantity || undefined,
        quoteAmount: Number(dto.quoteAmount),
        rfqId: rfq.id,
        notes: dto.notes,
        specifications: dto.specifications,
      });

      await this.emailService.queueEmail({
        to: rfq.inquiry.email,
        subject: quoteTemplate.subject,
        html: quoteTemplate.html,
        text: quoteTemplate.text,
        templateName: 'quote_sent',
        templateData: {
          rfqId: rfq.id,
          quoteAmount: dto.quoteAmount,
        },
      });
    }

    return {
      rfq,
      message: 'Quote sent successfully',
    };
  }

  /**
   * Get RFQ statistics
   */
  async getStats() {
    const total = await this.prisma.rfqRequest.count();
    const pending = await this.prisma.rfqRequest.count({
      where: { status: 'pending' },
    });
    const quoted = await this.prisma.rfqRequest.count({
      where: { status: 'quoted' },
    });
    const won = await this.prisma.rfqRequest.count({
      where: { status: 'won' },
    });
    const lost = await this.prisma.rfqRequest.count({
      where: { status: 'lost' },
    });

    // Calculate conversion rate
    const totalClosed = won + lost;
    const conversionRate = totalClosed > 0 ? (won / totalClosed) * 100 : 0;

    // Calculate total value
    const wonRfqs = await this.prisma.rfqRequest.findMany({
      where: { status: 'won', quoteAmount: { not: null } },
      select: { quoteAmount: true },
    });

    const totalValue = wonRfqs.reduce(
      (sum, rfq) => sum + (rfq.quoteAmount ? Number(rfq.quoteAmount) : 0),
      0,
    );

    return {
      total,
      byStatus: {
        pending,
        quoted,
        won,
        lost,
      },
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalValue,
      averageQuoteValue: won > 0 ? Math.round(totalValue / won) : 0,
    };
  }

  /**
   * Export RFQs to CSV format
   */
  async exportToCSV(query: QueryRfqDto) {
    const { data } = await this.findAll({ ...query, limit: 1000 }); // Max 1000 for export

    // Convert to CSV
    const headers = [
      'ID',
      'Product',
      'Quantity',
      'Budget Range',
      'Timeline',
      'Status',
      'Quote Amount',
      'Quote Sent',
      'Customer Name',
      'Customer Email',
      'Company',
      'Created At',
    ].join(',');

    const rows = data.map((rfq) =>
      [
        rfq.id,
        rfq.productCategory,
        rfq.quantity || '',
        rfq.budgetRange || '',
        rfq.timeline || '',
        rfq.status,
        rfq.quoteAmount ? `$${rfq.quoteAmount}` : '',
        rfq.quoteSentAt || '',
        rfq.inquiry?.fullName || '',
        rfq.inquiry?.email || '',
        rfq.inquiry?.company || '',
        rfq.createdAt.toISOString(),
      ].join(','),
    );

    const csv = [headers, ...rows].join('\n');

    return {
      filename: `rfq-export-${new Date().toISOString().split('T')[0]}.csv`,
      content: csv,
      count: data.length,
    };
  }
}

