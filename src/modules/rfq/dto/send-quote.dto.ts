import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const SendQuoteSchema = z.object({
  quoteAmount: z.number().positive('Quote amount must be positive'),
  notes: z.string().max(5000).optional(),
  specifications: z.record(z.any()).optional(),
});

export type SendQuoteDto = z.infer<typeof SendQuoteSchema>;

export class SendQuoteDtoClass implements SendQuoteDto {
  @ApiProperty({
    example: 2500000,
    description: 'Quote amount in USD',
  })
  quoteAmount: number;

  @ApiProperty({
    example: 'Quote includes installation, training, and 5-year support',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    required: false,
    example: {
      deliveryTime: '6 months',
      warranty: '5 years',
      training: '2 weeks on-site',
      support: '24/7 technical support',
    },
  })
  specifications?: Record<string, any>;
}

