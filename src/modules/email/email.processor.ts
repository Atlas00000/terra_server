import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from './email.service';

@Injectable()
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  private isProcessing = false;

  constructor(private emailService: EmailService) {}

  /**
   * Process email queue every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processEmailQueue() {
    // Prevent concurrent processing
    if (this.isProcessing) {
      this.logger.debug('Email queue processing already in progress, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      const result = await this.emailService.processPendingEmails();
      
      if (result.processed > 0) {
        this.logger.log(
          `📬 Processed ${result.processed} emails: ${result.succeeded} sent, ${result.failed} failed`,
        );
      }
    } catch (error) {
      this.logger.error(`❌ Email queue processing error: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Retry failed emails every 30 minutes
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async retryFailedEmails() {
    this.logger.log('🔄 Checking for failed emails to retry...');
    
    // This will be called automatically, no need to implement manually
    // Failed emails with < 3 attempts will be picked up by processPendingEmails
  }
}

