import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const QueryInquirySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']).optional(),
  sortBy: z.enum(['createdAt', 'leadScore', 'updatedAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(), // Search in name, email, company, message
});

export type QueryInquiryDto = z.infer<typeof QueryInquirySchema>;

export class QueryInquiryDtoClass implements QueryInquiryDto {
  @ApiProperty({ example: 1, required: false, default: 1 })
  page: number;

  @ApiProperty({ example: 20, required: false, default: 20, maximum: 100 })
  limit: number;

  @ApiProperty({
    example: 'new',
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    required: false,
  })
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';

  @ApiProperty({
    example: 'createdAt',
    enum: ['createdAt', 'leadScore', 'updatedAt'],
    required: false,
    default: 'createdAt',
  })
  sortBy: 'createdAt' | 'leadScore' | 'updatedAt';

  @ApiProperty({
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc',
  })
  order: 'asc' | 'desc';

  @ApiProperty({ example: 'john', required: false })
  search?: string;
}

