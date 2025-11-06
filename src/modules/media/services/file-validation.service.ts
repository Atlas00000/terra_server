import { Injectable, BadRequestException } from '@nestjs/common';
import { r2Config } from '../../../config/r2.config';

@Injectable()
export class FileValidationService {
  /**
   * Validate file type
   */
  validateFileType(mimetype: string, fileType: 'image' | 'document' | 'any'): void {
    const allowedTypes = fileType === 'image' 
      ? r2Config.allowedImageTypes
      : fileType === 'document'
      ? r2Config.allowedDocTypes
      : [...r2Config.allowedImageTypes, ...r2Config.allowedDocTypes];

    if (!allowedTypes.includes(mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }
  }

  /**
   * Validate file size
   */
  validateFileSize(size: number, maxSize: number = r2Config.maxFileSize): void {
    if (size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      const fileSizeMB = (size / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `File too large. Maximum size: ${maxSizeMB}MB, got: ${fileSizeMB}MB`,
      );
    }
  }

  /**
   * Validate file name (security)
   */
  validateFileName(filename: string): void {
    // Check for path traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Invalid file name: path traversal not allowed');
    }

    // Check for null bytes
    if (filename.includes('\0')) {
      throw new BadRequestException('Invalid file name: null bytes not allowed');
    }

    // Check length
    if (filename.length > 255) {
      throw new BadRequestException('File name too long (max 255 characters)');
    }
  }

  /**
   * Sanitize file name
   */
  sanitizeFileName(filename: string): string {
    // Remove special characters, keep only alphanumeric, dots, hyphens, underscores
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/--+/g, '-')
      .toLowerCase();
  }

  /**
   * Get file type category from mime type
   */
  getFileTypeCategory(mimetype: string): 'image' | 'document' | 'other' {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.includes('pdf') || mimetype.includes('document')) return 'document';
    return 'other';
  }
}

