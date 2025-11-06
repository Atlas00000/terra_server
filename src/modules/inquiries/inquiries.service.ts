import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInquiryDto, CreateInquirySchema } from './dto/create-inquiry.dto';
import { UpdateInquiryDto, UpdateInquirySchema } from './dto/update-inquiry.dto';
import { QueryInquiryDto, QueryInquirySchema } from './dto/query-inquiry.dto';
import { LeadScoringService } from './services/lead-scoring.service';
import { EmailService } from '../email/email.service';
import { inquiryConfirmationTemplate } from '../email/templates/inquiry-confirmation.template';
import { adminNotificationTemplate } from '../email/templates/admin-notification.template';

@Injectable()
export class InquiriesService {
  constructor(
    private prisma: PrismaService,
    private leadScoringService: LeadScoringService,
    private emailService: EmailService,
  ) {}

  /**
   * Create new inquiry (from contact form)
   */
  async create(dto: CreateInquiryDto, ipAddress?: string, userAgent?: string) {
    // Validate input
    const validated = CreateInquirySchema.safeParse(dto);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }

    // Calculate lead score
    const leadScore = this.leadScoringService.calculateScore(dto);

    // Create inquiry
    const inquiry = await this.prisma.inquiry.create({
      data: {
        inquiryType: dto.inquiryType,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone || null,
        company: dto.company || null,
        country: dto.country,
        message: dto.message,
        metadata: dto.metadata || {},
        leadScore,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        source: 'website',
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Queue confirmation email to customer
    const confirmationTemplate = inquiryConfirmationTemplate({
      fullName: dto.fullName,
      inquiryId: inquiry.id,
      inquiryType: dto.inquiryType,
    });

    await this.emailService.queueEmail({
      to: dto.email,
      subject: confirmationTemplate.subject,
      html: confirmationTemplate.html,
      text: confirmationTemplate.text,
      templateName: 'inquiry_confirmation',
      templateData: { inquiryId: inquiry.id },
    });

    // Queue notification email to admin (if high priority)
    if (leadScore >= 40) {
      const adminTemplate = adminNotificationTemplate({
        fullName: dto.fullName,
        email: dto.email,
        company: dto.company,
        country: dto.country,
        inquiryType: dto.inquiryType,
        leadScore,
        message: dto.message,
        inquiryId: inquiry.id,
      });

      const adminEmail = process.env.ADMIN_EMAIL || 'admin@terraindustries.com';
      
      await this.emailService.queueEmail({
        to: adminEmail,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        text: adminTemplate.text,
        templateName: 'admin_notification',
        templateData: { inquiryId: inquiry.id },
      });
    }

    return inquiry;
  }

  /**
   * Find all inquiries with pagination and filtering
   */
  async findAll(query: QueryInquiryDto) {
    // Validate query params
    const validated = QueryInquirySchema.safeParse(query);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }

    const { page, limit, status, sortBy, order, search } = validated.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.inquiry.count({ where });

    // Get inquiries
    const inquiries = await this.prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
      include: {
        assignedTo: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
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
   * Find one inquiry by ID
   */
  async findOne(id: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!inquiry) {
      throw new NotFoundException(`Inquiry with ID ${id} not found`);
    }

    return inquiry;
  }

  /**
   * Update inquiry
   */
  async update(id: string, dto: UpdateInquiryDto) {
    // Validate input
    const validated = UpdateInquirySchema.safeParse(dto);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }

    // Check if inquiry exists
    await this.findOne(id);

    // Verify assigned user exists if provided
    if (dto.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.assignedToId },
      });
      if (!user) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    // Update inquiry
    const inquiry = await this.prisma.inquiry.update({
      where: { id },
      data: {
        status: dto.status,
        assignedToId: dto.assignedToId,
        metadata: dto.metadata,
        updatedAt: new Date(),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return inquiry;
  }

  /**
   * Delete inquiry (soft delete - set status to closed)
   */
  async remove(id: string) {
    // Check if inquiry exists
    await this.findOne(id);

    // Soft delete by setting status to closed
    await this.prisma.inquiry.update({
      where: { id },
      data: {
        status: 'closed',
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Inquiry deleted successfully',
    };
  }

  /**
   * Get inquiry statistics
   */
  async getStats() {
    const total = await this.prisma.inquiry.count();
    const newInquiries = await this.prisma.inquiry.count({
      where: { status: 'new' },
    });
    const inProgress = await this.prisma.inquiry.count({
      where: { status: 'in_progress' },
    });
    const highPriority = await this.prisma.inquiry.count({
      where: { leadScore: { gte: 70 } },
    });

    return {
      total,
      newInquiries,
      inProgress,
      highPriority,
    };
  }
}

