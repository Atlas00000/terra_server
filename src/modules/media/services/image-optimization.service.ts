import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

export interface OptimizedImage {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
  format: string;
}

@Injectable()
export class ImageOptimizationService {
  private readonly logger = new Logger(ImageOptimizationService.name);

  /**
   * Optimize image: resize, compress, convert to WebP
   */
  async optimizeImage(
    buffer: Buffer,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 80,
  ): Promise<OptimizedImage> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Resize if needed
      let resized = image;
      if (metadata.width && metadata.width > maxWidth) {
        resized = image.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert to WebP and compress
      const optimized = await resized
        .webp({ quality })
        .toBuffer({ resolveWithObject: true });

      this.logger.log(
        `🖼️  Image optimized: ${metadata.width}x${metadata.height} → ${optimized.info.width}x${optimized.info.height}`,
      );

      return {
        buffer: optimized.data,
        width: optimized.info.width,
        height: optimized.info.height,
        size: optimized.info.size,
        format: 'webp',
      };
    } catch (error) {
      this.logger.error(`❌ Image optimization failed: ${error.message}`);
      throw new Error(`Failed to optimize image: ${error.message}`);
    }
  }

  /**
   * Get image dimensions without full optimization
   */
  async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      return { width: 0, height: 0 };
    }
  }

  /**
   * Create thumbnail
   */
  async createThumbnail(
    buffer: Buffer,
    width: number = 200,
    height: number = 200,
  ): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 70 })
        .toBuffer();
    } catch (error) {
      this.logger.error(`❌ Thumbnail creation failed: ${error.message}`);
      throw new Error(`Failed to create thumbnail: ${error.message}`);
    }
  }
}

