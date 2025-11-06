import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { PrismaService } from '../../prisma/prisma.service';

interface QueueEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  templateName?: string;
  templateData?: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor(private prisma: PrismaService) {
    // Initialize Resend only if API key is provided
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey.length > 0) {
      this.resend = new Resend(apiKey);
      this.logger.log('✅ Resend email service initialized');
    } else {
      this.logger.warn('⚠️  RESEND_API_KEY not set - emails will be queued but not sent');
    }
  }

  /**
   * Queue an email for sending
   */
  async queueEmail(options: QueueEmailOptions) {
    const email = await this.prisma.emailQueue.create({
      data: {
        toEmail: options.to,
        fromEmail: process.env.EMAIL_FROM || 'noreply@terraindustries.com',
        subject: options.subject,
        bodyHtml: options.html,
        bodyText: options.text,
        templateName: options.templateName,
        templateData: options.templateData || {},
        status: 'pending',
      },
    });

    this.logger.log(`📧 Email queued: ${email.id} to ${options.to}`);
    
    return email;
  }

  /**
   * Process pending emails from queue
   */
  async processPendingEmails() {
    // Get pending emails (limit 10 per batch)
    const pendingEmails = await this.prisma.emailQueue.findMany({
      where: {
        status: 'pending',
        attempts: { lt: 3 }, // Max 3 attempts
      },
      take: 10,
      orderBy: { createdAt: 'asc' },
    });

    if (pendingEmails.length === 0) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    this.logger.log(`📨 Processing ${pendingEmails.length} pending emails`);

    let succeeded = 0;
    let failed = 0;

    for (const email of pendingEmails) {
      const result = await this.sendEmail(email.id);
      if (result.success) {
        succeeded++;
      } else {
        failed++;
      }
    }

    return {
      processed: pendingEmails.length,
      succeeded,
      failed,
    };
  }

  /**
   * Send a single email
   */
  async sendEmail(emailId: string) {
    const email = await this.prisma.emailQueue.findUnique({
      where: { id: emailId },
    });

    if (!email) {
      return { success: false, error: 'Email not found' };
    }

    // Update attempt count
    await this.prisma.emailQueue.update({
      where: { id: emailId },
      data: {
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    });

    // If Resend is not configured, mark as failed
    if (!this.resend) {
      await this.prisma.emailQueue.update({
        where: { id: emailId },
        data: {
          status: 'failed',
          errorMessage: 'RESEND_API_KEY not configured',
        },
      });

      this.logger.warn(`⚠️  Email ${emailId} failed: Resend not configured`);
      return { success: false, error: 'Resend not configured' };
    }

    try {
      // Send email via Resend
      const result = await this.resend.emails.send({
        from: email.fromEmail || process.env.EMAIL_FROM || 'noreply@terraindustries.com',
        to: email.toEmail,
        subject: email.subject,
        html: email.bodyHtml || '',
        text: email.bodyText || '',
      });

      // Mark as sent
      await this.prisma.emailQueue.update({
        where: { id: emailId },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      });

      this.logger.log(`✅ Email sent: ${emailId} to ${email.toEmail}`);
      
      return { success: true, result };
    } catch (error) {
      // Mark as failed
      await this.prisma.emailQueue.update({
        where: { id: emailId },
        data: {
          status: email.attempts >= 2 ? 'failed' : 'pending', // Failed after 3 attempts
          errorMessage: error.message || 'Unknown error',
        },
      });

      this.logger.error(`❌ Email failed: ${emailId} - ${error.message}`);
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Get email queue statistics
   */
  async getQueueStats() {
    const total = await this.prisma.emailQueue.count();
    const pending = await this.prisma.emailQueue.count({
      where: { status: 'pending' },
    });
    const sent = await this.prisma.emailQueue.count({
      where: { status: 'sent' },
    });
    const failed = await this.prisma.emailQueue.count({
      where: { status: 'failed' },
    });

    return {
      total,
      pending,
      sent,
      failed,
      successRate: total > 0 ? Math.round((sent / total) * 100) : 0,
    };
  }

  /**
   * Retry failed email
   */
  async retryEmail(emailId: string) {
    const email = await this.prisma.emailQueue.findUnique({
      where: { id: emailId },
    });

    if (!email) {
      throw new Error('Email not found');
    }

    // Reset status and attempts
    await this.prisma.emailQueue.update({
      where: { id: emailId },
      data: {
        status: 'pending',
        attempts: 0,
        errorMessage: null,
      },
    });

    this.logger.log(`🔄 Email ${emailId} reset for retry`);

    // Try to send immediately
    return this.sendEmail(emailId);
  }
}

