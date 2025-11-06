import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const QueryProductSpecSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  category: z.enum(['duma', 'archer', 'artemis', 'kallon', 'iroko']).optional(),
});

export class QueryProductSpecDtoClass extends createZodDto(QueryProductSpecSchema) {
  @ApiProperty({ example: 1, required: false, default: 1 })
  page: number;

  @ApiProperty({ example: 20, required: false, default: 20 })
  limit: number;

  @ApiProperty({
    example: 'archer',
    enum: ['duma', 'archer', 'artemis', 'kallon', 'iroko'],
    required: false,
  })
  category?: 'duma' | 'archer' | 'artemis' | 'kallon' | 'iroko';
}

