import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const UpdateRfqSchema = z.object({
  status: z.enum(['pending', 'quoted', 'won', 'lost']).optional(),
  quoteAmount: z.number().positive().optional(),
  decisionDate: z.union([
    z.string().datetime(), // ISO datetime: "2025-12-31T00:00:00Z"
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Date only: "2025-12-31"
    z.date(),
  ]).optional(),
  notes: z.string().max(5000).optional(),
  specifications: z.record(z.any()).optional(),
});

export type UpdateRfqDto = z.infer<typeof UpdateRfqSchema>;

export class UpdateRfqDtoClass implements UpdateRfqDto {
  @ApiProperty({
    example: 'quoted',
    enum: ['pending', 'quoted', 'won', 'lost'],
    required: false,
  })
  status?: 'pending' | 'quoted' | 'won' | 'lost';

  @ApiProperty({ example: 2500000, required: false, description: 'Quote amount in USD' })
  quoteAmount?: number;

  @ApiProperty({ example: '2025-12-15', required: false })
  decisionDate?: string | Date;

  @ApiProperty({ example: 'Customer requested additional features', required: false })
  notes?: string;

  @ApiProperty({
    required: false,
    example: { deliveryTime: '6 months', warranty: '5 years' },
  })
  specifications?: Record<string, any>;
}

