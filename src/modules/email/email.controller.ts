import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('email')
@Controller('email')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('queue')
  @ApiOperation({ summary: 'View email queue status (admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'sent', 'failed'] })
  @ApiResponse({ status: 200, description: 'Email queue status' })
  async getQueue(@Query('status') status?: string) {
    const where = status ? { status } : {};
    
    return this.emailService.getQueueStats();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get email queue statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Email statistics' })
  async getStats() {
    return this.emailService.getQueueStats();
  }

  @Post('retry/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry failed email (admin only)' })
  @ApiResponse({ status: 200, description: 'Email retry initiated' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async retryEmail(@Param('id') id: string) {
    const result = await this.emailService.retryEmail(id);
    return {
      message: result.success ? 'Email sent successfully' : 'Email retry failed',
      success: result.success,
    };
  }

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger email queue processing (admin only)' })
  @ApiResponse({ status: 200, description: 'Email queue processed' })
  async processQueue() {
    const result = await this.emailService.processPendingEmails();
    return {
      message: `Processed ${result.processed} emails`,
      ...result,
    };
  }
}

