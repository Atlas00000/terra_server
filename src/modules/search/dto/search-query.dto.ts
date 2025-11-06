import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const SearchQuerySchema = z.object({
  q: z.string().min(2).max(100).optional().describe('Search query'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  
  // Date filters
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  
  // Multi-select filters
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  statuses: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  
  // Numeric range filters
  minScore: z.coerce.number().int().min(0).max(100).optional(),
  maxScore: z.coerce.number().int().min(0).max(100).optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

export class SearchQueryDtoClass extends createZodDto(SearchQuerySchema) {
  @ApiProperty({ example: 'archer', required: false })
  q?: string;

  @ApiProperty({ example: 1, required: false, default: 1 })
  page: number;

  @ApiProperty({ example: 20, required: false, default: 20 })
  limit: number;

  @ApiProperty({ example: 'createdAt', required: false, default: 'createdAt' })
  sortBy: string;

  @ApiProperty({ example: 'desc', enum: ['asc', 'desc'], required: false, default: 'desc' })
  sortOrder: 'asc' | 'desc';

  @ApiProperty({ example: '2025-01-01', required: false })
  dateFrom?: Date;

  @ApiProperty({ example: '2025-12-31', required: false })
  dateTo?: Date;

  @ApiProperty({ example: ['archer', 'duma'], required: false })
  categories?: string[];

  @ApiProperty({ example: ['urgent', 'military'], required: false })
  tags?: string[];

  @ApiProperty({ example: ['new', 'contacted'], required: false })
  statuses?: string[];

  @ApiProperty({ example: ['NG', 'KE'], required: false })
  countries?: string[];

  @ApiProperty({ example: 60, required: false })
  minScore?: number;

  @ApiProperty({ example: 100, required: false })
  maxScore?: number;

  @ApiProperty({ example: 100000, required: false })
  minAmount?: number;

  @ApiProperty({ example: 10000000, required: false })
  maxAmount?: number;
}

