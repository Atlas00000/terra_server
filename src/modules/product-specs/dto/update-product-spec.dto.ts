import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateProductSpecSchema = z.object({
  productName: z.string().min(2).max(100).optional().describe('Product name'),
  specifications: z.record(z.any()).optional().describe('Product specifications'),
  performanceMetrics: z.record(z.any()).optional().describe('Performance metrics'),
  technicalDetails: z.record(z.any()).optional().describe('Technical details'),
  mediaGalleryIds: z.array(z.string().uuid()).optional().describe('Media gallery IDs'),
});

export class UpdateProductSpecDtoClass extends createZodDto(UpdateProductSpecSchema) {
  @ApiProperty({ example: 'Updated Archer VTOL Reconnaissance System', required: false })
  productName?: string;

  @ApiProperty({
    example: {
      dimensions: { length: '3.2m', wingspan: '4.6m', height: '0.9m', weight: '46kg' },
    },
    required: false,
  })
  specifications?: Record<string, any>;

  @ApiProperty({
    example: { maxSpeed: '125 km/h', range: '220 km' },
    required: false,
  })
  performanceMetrics?: Record<string, any>;

  @ApiProperty({
    example: { sensors: ['4K camera', 'Thermal imaging', 'LiDAR', 'Multispectral camera'] },
    required: false,
  })
  technicalDetails?: Record<string, any>;

  @ApiProperty({
    example: ['a1b2c3d4-e5f6-7890-1234-567890abcdef'],
    required: false,
  })
  mediaGalleryIds?: string[];
}

