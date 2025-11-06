import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateProductSpecSchema = z.object({
  productName: z.string().min(2).max(100).describe('Product name'),
  category: z
    .enum(['duma', 'archer', 'artemis', 'kallon', 'iroko'])
    .describe('Product category'),
  specifications: z.record(z.any()).describe('Product specifications (JSON object)'),
  performanceMetrics: z.record(z.any()).describe('Performance metrics (JSON object)'),
  technicalDetails: z.record(z.any()).describe('Technical details (JSON object)'),
  mediaGalleryIds: z
    .array(z.string().uuid())
    .optional()
    .describe('Array of media file IDs for gallery'),
});

export class CreateProductSpecDtoClass extends createZodDto(CreateProductSpecSchema) {
  @ApiProperty({ example: 'Archer VTOL Reconnaissance System' })
  productName: string;

  @ApiProperty({ example: 'archer', enum: ['duma', 'archer', 'artemis', 'kallon', 'iroko'] })
  category: 'duma' | 'archer' | 'artemis' | 'kallon' | 'iroko';

  @ApiProperty({
    example: {
      dimensions: { length: '3.2m', wingspan: '4.5m', height: '0.9m', weight: '45kg' },
      materials: ['Carbon fiber composite', 'Aluminum alloy', 'Kevlar'],
      capabilities: ['VTOL operation', 'Autonomous flight', 'AI-powered reconnaissance'],
    },
  })
  specifications: Record<string, any>;

  @ApiProperty({
    example: {
      maxSpeed: '120 km/h',
      cruiseSpeed: '80 km/h',
      range: '200 km',
      endurance: '8 hours',
      maxAltitude: '5000m',
      payload: '15kg',
    },
  })
  performanceMetrics: Record<string, any>;

  @ApiProperty({
    example: {
      powerSystem: 'Hybrid electric',
      sensors: ['4K camera', 'Thermal imaging', 'LiDAR'],
      communication: 'Encrypted RF link up to 50km',
      autonomy: 'Full autonomous mission planning with AI',
    },
  })
  technicalDetails: Record<string, any>;

  @ApiProperty({
    example: ['a1b2c3d4-e5f6-7890-1234-567890abcdef', 'b2c3d4e5-f6a7-8901-2345-67890abcdef1'],
    required: false,
  })
  mediaGalleryIds?: string[];
}

