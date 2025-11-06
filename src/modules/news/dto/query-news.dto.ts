import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const QueryNewsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  authorId: z.string().uuid().optional(),
});

export class QueryNewsDtoClass extends createZodDto(QueryNewsSchema) {
  @ApiProperty({ example: 1, required: false, default: 1 })
  page: number;

  @ApiProperty({ example: 20, required: false, default: 20 })
  limit: number;

  @ApiProperty({ example: 'published', enum: ['draft', 'published', 'archived'], required: false })
  status?: 'draft' | 'published' | 'archived';

  @ApiProperty({ example: 'product-updates', required: false })
  category?: string;

  @ApiProperty({ example: 'archer', required: false })
  tag?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: false })
  authorId?: string;
}

