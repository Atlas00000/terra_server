import { Module } from '@nestjs/common';
import { RfqController } from './rfq.controller';
import { RfqService } from './rfq.service';
import { RfqWorkflowService } from './services/rfq-workflow.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [RfqController],
  providers: [RfqService, RfqWorkflowService],
  exports: [RfqService],
})
export class RfqModule {}

