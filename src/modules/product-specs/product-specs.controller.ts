import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ProductSpecsService } from './product-specs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateProductSpecDtoClass } from './dto/create-product-spec.dto';
import { UpdateProductSpecDtoClass } from './dto/update-product-spec.dto';
import { QueryProductSpecDtoClass } from './dto/query-product-spec.dto';
import { CACHE_TTL } from '../../config/cache.config';

@ApiTags('product-specs')
@Controller('product-specs')
export class ProductSpecsController {
  constructor(private readonly productSpecsService: ProductSpecsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product specification (admin only)' })
  @ApiResponse({ status: 201, description: 'Product specification created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async create(@Body() body: any, @CurrentUser() user: any) {
    return this.productSpecsService.create(
      body.productName,
      body.category,
      body.specifications,
      body.performanceMetrics,
      body.technicalDetails,
      user.id,
      body.mediaGalleryIds,
    );
  }

  @Get()
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.PRODUCT_LIST)
  @ApiOperation({ summary: 'Get all product specifications (public)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ['duma', 'archer', 'artemis', 'kallon', 'iroko'],
  })
  @ApiResponse({ status: 200, description: 'List of product specifications' })
  async findAll(@Query() query: QueryProductSpecDtoClass) {
    return this.productSpecsService.findAll(query.page, query.limit, query.category);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product specs statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Product specs statistics' })
  async getStats() {
    return this.productSpecsService.getStats();
  }

  @Get('category/:category')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.PRODUCT_LIST)
  @ApiOperation({ summary: 'Get specifications by category (public)' })
  @ApiParam({
    name: 'category',
    enum: ['duma', 'archer', 'artemis', 'kallon', 'iroko'],
  })
  @ApiResponse({ status: 200, description: 'Product specifications for category' })
  async findByCategory(@Param('category') category: string) {
    return this.productSpecsService.findByCategory(category);
  }

  @Get(':id')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.PRODUCT_SINGLE)
  @ApiOperation({ summary: 'Get product specification by ID (public)' })
  @ApiResponse({ status: 200, description: 'Product specification details' })
  @ApiResponse({ status: 404, description: 'Product specification not found' })
  async findOne(@Param('id') id: string) {
    return this.productSpecsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product specification (admin only)' })
  @ApiResponse({ status: 200, description: 'Product specification updated successfully' })
  @ApiResponse({ status: 404, description: 'Product specification not found' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.productSpecsService.update(
      id,
      body.productName,
      body.specifications,
      body.performanceMetrics,
      body.technicalDetails,
      body.mediaGalleryIds,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product specification (admin only)' })
  @ApiResponse({ status: 200, description: 'Product specification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product specification not found' })
  async remove(@Param('id') id: string) {
    return this.productSpecsService.remove(id);
  }
}

