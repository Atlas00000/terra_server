import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateNewsSchema = z.object({
  title: z.string().min(5).max(200).describe('News story title'),
  content: z.string().min(50).describe('Full news story content (Markdown/HTML supported)'),
  excerpt: z.string().min(20).max(300).optional().describe('Short summary/excerpt'),
  featuredImageId: z.string().uuid().optional().describe('ID of featured image from media library'),
  category: z
    .enum(['company-news', 'product-updates', 'industry-insights', 'events', 'press-releases'])
    .optional()
    .describe('Story category'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
});

export class CreateNewsDtoClass extends createZodDto(CreateNewsSchema) {
  @ApiProperty({ example: 'Terra Industries Launches Revolutionary Archer VTOL System' })
  title: string;

  @ApiProperty({
    example:
      'Terra Industries today announced the launch of the Archer VTOL reconnaissance system...',
  })
  content: string;

  @ApiProperty({
    example: 'Revolutionary new VTOL system combines advanced AI with autonomous capabilities',
    required: false,
  })
  excerpt?: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    required: false,
  })
  featuredImageId?: string;

  @ApiProperty({
    example: 'product-updates',
    enum: ['company-news', 'product-updates', 'industry-insights', 'events', 'press-releases'],
    required: false,
  })
  category?: 'company-news' | 'product-updates' | 'industry-insights' | 'events' | 'press-releases';

  @ApiProperty({
    example: ['archer', 'vtol', 'reconnaissance', 'autonomous'],
    required: false,
  })
  tags?: string[];
}

