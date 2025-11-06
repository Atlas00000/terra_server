import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const QueryRfqSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['pending', 'quoted', 'won', 'lost']).optional(),
  productCategory: z.enum(['duma', 'archer', 'artemis', 'kallon', 'iroko']).optional(),
  sortBy: z.enum(['createdAt', 'quoteAmount', 'updatedAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryRfqDto = z.infer<typeof QueryRfqSchema>;

export class QueryRfqDtoClass implements QueryRfqDto {
  @ApiProperty({ example: 1, required: false, default: 1 })
  page: number;

  @ApiProperty({ example: 20, required: false, default: 20, maximum: 100 })
  limit: number;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'quoted', 'won', 'lost'],
    required: false,
  })
  status?: 'pending' | 'quoted' | 'won' | 'lost';

  @ApiProperty({
    example: 'archer',
    enum: ['duma', 'archer', 'artemis', 'kallon', 'iroko'],
    required: false,
  })
  productCategory?: 'duma' | 'archer' | 'artemis' | 'kallon' | 'iroko';

  @ApiProperty({
    example: 'createdAt',
    enum: ['createdAt', 'quoteAmount', 'updatedAt'],
    required: false,
    default: 'createdAt',
  })
  sortBy: 'createdAt' | 'quoteAmount' | 'updatedAt';

  @ApiProperty({
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc',
  })
  order: 'asc' | 'desc';
}

