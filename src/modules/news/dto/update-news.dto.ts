import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateNewsSchema = z.object({
  title: z.string().min(5).max(200).optional().describe('News story title'),
  content: z.string().min(50).optional().describe('Full news story content'),
  excerpt: z.string().min(20).max(300).optional().describe('Short summary/excerpt'),
  featuredImageId: z.string().uuid().nullable().optional().describe('ID of featured image'),
  category: z
    .enum(['company-news', 'product-updates', 'industry-insights', 'events', 'press-releases'])
    .optional()
    .describe('Story category'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
});

export class UpdateNewsDtoClass extends createZodDto(UpdateNewsSchema) {
  @ApiProperty({ example: 'Updated: Terra Industries Launches Archer VTOL', required: false })
  title?: string;

  @ApiProperty({
    example: 'Updated content about the Archer VTOL system...',
    required: false,
  })
  content?: string;

  @ApiProperty({
    example: 'Updated summary of the revolutionary VTOL system',
    required: false,
  })
  excerpt?: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    required: false,
    nullable: true,
  })
  featuredImageId?: string | null;

  @ApiProperty({
    example: 'product-updates',
    enum: ['company-news', 'product-updates', 'industry-insights', 'events', 'press-releases'],
    required: false,
  })
  category?: 'company-news' | 'product-updates' | 'industry-insights' | 'events' | 'press-releases';

  @ApiProperty({
    example: ['archer', 'vtol', 'updated'],
    required: false,
  })
  tags?: string[];
}

