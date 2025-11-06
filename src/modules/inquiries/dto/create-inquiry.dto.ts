import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const CreateInquirySchema = z.object({
  inquiryType: z.enum(['general', 'sales', 'support', 'partnership'], {
    errorMap: () => ({ message: 'Invalid inquiry type' }),
  }),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().max(255).optional(),
  country: z.string().min(2, 'Country is required').max(100),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  metadata: z.record(z.any()).optional(), // Additional data like budget, timeline
});

export type CreateInquiryDto = z.infer<typeof CreateInquirySchema>;

export class CreateInquiryDtoClass implements CreateInquiryDto {
  @ApiProperty({
    example: 'sales',
    enum: ['general', 'sales', 'support', 'partnership'],
  })
  inquiryType: 'general' | 'sales' | 'support' | 'partnership';

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: '+234-123-4567', required: false })
  phone?: string;

  @ApiProperty({ example: 'Defense Corporation', required: false })
  company?: string;

  @ApiProperty({ example: 'NG' })
  country: string;

  @ApiProperty({
    example: 'We are interested in purchasing 10 Archer VTOL units for border patrol operations.',
  })
  message: string;

  @ApiProperty({ required: false, example: { budget: '>$1M', timeline: '3-6_months' } })
  metadata?: Record<string, any>;
}

