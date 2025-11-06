import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const CreateRfqSchema = z.object({
  inquiryId: z.string().uuid().optional(),
  productCategory: z.enum(['duma', 'archer', 'artemis', 'kallon', 'iroko'], {
    errorMap: () => ({ message: 'Invalid product category' }),
  }),
  quantity: z.number().int().positive().optional(),
  budgetRange: z.enum(['<$100K', '$100K-$500K', '$500K-$1M', '>$1M']).optional(),
  timeline: z.enum(['immediate', '3-6_months', '6-12_months', '12+_months']).optional(),
  requirements: z.string().max(5000).optional(),
  specifications: z.record(z.any()).optional(),
});

export type CreateRfqDto = z.infer<typeof CreateRfqSchema>;

export class CreateRfqDtoClass implements CreateRfqDto {
  @ApiProperty({
    example: '37d525df-2a6a-4ce7-b0c3-b4f2b9aa0ed3',
    required: false,
    description: 'Link to existing inquiry',
  })
  inquiryId?: string;

  @ApiProperty({
    example: 'archer',
    enum: ['duma', 'archer', 'artemis', 'kallon', 'iroko'],
  })
  productCategory: 'duma' | 'archer' | 'artemis' | 'kallon' | 'iroko';

  @ApiProperty({ example: 20, required: false })
  quantity?: number;

  @ApiProperty({
    example: '>$1M',
    enum: ['<$100K', '$100K-$500K', '$500K-$1M', '>$1M'],
    required: false,
  })
  budgetRange?: '<$100K' | '$100K-$500K' | '$500K-$1M' | '>$1M';

  @ApiProperty({
    example: '3-6_months',
    enum: ['immediate', '3-6_months', '6-12_months', '12+_months'],
    required: false,
  })
  timeline?: 'immediate' | '3-6_months' | '6-12_months' | '12+_months';

  @ApiProperty({
    example: 'Need surveillance system for border monitoring with night vision capabilities',
    required: false,
  })
  requirements?: string;

  @ApiProperty({
    required: false,
    example: { range: '50km', resolution: '4K', nightVision: true },
  })
  specifications?: Record<string, any>;
}

