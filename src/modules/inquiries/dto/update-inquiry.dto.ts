import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const UpdateInquirySchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']).optional(),
  assignedToId: z.string().uuid().optional().nullable(),
  metadata: z.record(z.any()).optional(),
});

export type UpdateInquiryDto = z.infer<typeof UpdateInquirySchema>;

export class UpdateInquiryDtoClass implements UpdateInquiryDto {
  @ApiProperty({
    example: 'in_progress',
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    required: false,
  })
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    nullable: true,
  })
  assignedToId?: string | null;

  @ApiProperty({ required: false, example: { notes: 'Follow up in 2 weeks' } })
  metadata?: Record<string, any>;
}

