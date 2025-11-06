import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { RfqService } from './rfq.service';
import { CreateRfqDtoClass } from './dto/create-rfq.dto';
import { UpdateRfqDtoClass } from './dto/update-rfq.dto';
import { QueryRfqDtoClass } from './dto/query-rfq.dto';
import { SendQuoteDtoClass } from './dto/send-quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('rfq')
@Controller('rfq')
export class RfqController {
  constructor(private readonly rfqService: RfqService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit RFQ (Request for Quote) - public endpoint' })
  @ApiBody({ type: CreateRfqDtoClass })
  @ApiResponse({ status: 201, description: 'RFQ created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async create(@Body() dto: any) {
    return this.rfqService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all RFQs with pagination (admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'quoted', 'won', 'lost'] })
  @ApiQuery({ name: 'productCategory', required: false, enum: ['duma', 'archer', 'artemis', 'kallon', 'iroko'] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'quoteAmount', 'updatedAt'] })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'List of RFQs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: QueryRfqDtoClass) {
    return this.rfqService.findAll(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get RFQ statistics and conversion funnel (admin only)' })
  @ApiResponse({ status: 200, description: 'RFQ statistics' })
  async getStats() {
    return this.rfqService.getStats();
  }

  @Get('export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export RFQs to CSV (admin only)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'productCategory', required: false })
  @ApiResponse({ status: 200, description: 'CSV file download' })
  async export(@Query() query: QueryRfqDtoClass, @Res() res: Response) {
    const result = await this.rfqService.exportToCSV(query);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single RFQ by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'RFQ details' })
  @ApiResponse({ status: 404, description: 'RFQ not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return this.rfqService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update RFQ status (admin only)' })
  @ApiBody({ type: UpdateRfqDtoClass })
  @ApiResponse({ status: 200, description: 'RFQ updated successfully' })
  @ApiResponse({ status: 404, description: 'RFQ not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.rfqService.update(id, dto);
  }

  @Post(':id/quote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send quote to customer (admin only)' })
  @ApiBody({ type: SendQuoteDtoClass })
  @ApiResponse({ status: 200, description: 'Quote sent successfully' })
  @ApiResponse({ status: 404, description: 'RFQ not found' })
  @ApiResponse({ status: 400, description: 'Invalid status for quote' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendQuote(@Param('id') id: string, @Body() dto: any) {
    return this.rfqService.sendQuote(id, dto);
  }
}

