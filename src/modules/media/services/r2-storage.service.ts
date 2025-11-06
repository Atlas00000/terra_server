import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { createR2Client, r2Config } from '../../../config/r2.config';

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly client = createR2Client();

  /**
   * Upload file to R2
   */
  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    if (!this.client) {
      throw new Error('R2 client not configured');
    }

    const key = `${path}/${Date.now()}-${file.originalname}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: r2Config.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const publicUrl = `${r2Config.publicUrl}/${key}`;
      this.logger.log(`✅ File uploaded to R2: ${key}`);
      
      return publicUrl;
    } catch (error) {
      this.logger.error(`❌ R2 upload failed: ${error.message}`);
      throw new Error(`Failed to upload file to R2: ${error.message}`);
    }
  }

  /**
   * Delete file from R2
   */
  async deleteFile(path: string): Promise<void> {
    if (!this.client) {
      throw new Error('R2 client not configured');
    }

    // Extract key from full URL or use as-is
    const key = path.replace(`${r2Config.publicUrl}/`, '');

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: r2Config.bucketName,
          Key: key,
        }),
      );

      this.logger.log(`🗑️  File deleted from R2: ${key}`);
    } catch (error) {
      this.logger.error(`❌ R2 delete failed: ${error.message}`);
      throw new Error(`Failed to delete file from R2: ${error.message}`);
    }
  }

  /**
   * Check if file exists in R2
   */
  async fileExists(path: string): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    const key = path.replace(`${r2Config.publicUrl}/`, '');

    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: r2Config.bucketName,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }
}

