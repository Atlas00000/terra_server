import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { R2StorageService } from './services/r2-storage.service';
import { ImageOptimizationService } from './services/image-optimization.service';
import { FileValidationService } from './services/file-validation.service';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private r2Storage: R2StorageService,
    private imageOptimization: ImageOptimizationService,
    private fileValidation: FileValidationService,
  ) {}

  /**
   * Upload file to R2 and save metadata
   */
  async uploadFile(file: Express.Multer.File, userId: string, entityType?: string, entityId?: string) {
    // Validate file
    this.fileValidation.validateFileName(file.originalname);
    this.fileValidation.validateFileSize(file.size);

    const fileType = this.fileValidation.getFileTypeCategory(file.mimetype);
    
    // Only validate specific file types
    if (fileType === 'image') {
      this.fileValidation.validateFileType(file.mimetype, 'image');
    } else if (fileType === 'document') {
      this.fileValidation.validateFileType(file.mimetype, 'document');
    }

    let uploadBuffer = file.buffer;
    let width: number | undefined;
    let height: number | undefined;

    // Optimize images
    if (fileType === 'image') {
      const optimized = await this.imageOptimization.optimizeImage(file.buffer);
      uploadBuffer = optimized.buffer;
      width = optimized.width;
      height = optimized.height;
      file.mimetype = 'image/webp'; // Update mime type after optimization
    }

    // Upload to R2
    const publicUrl = await this.r2Storage.uploadFile(
      { ...file, buffer: uploadBuffer } as Express.Multer.File,
      fileType === 'image' ? 'images' : 'documents',
    );

    // Save metadata to database
    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        fileName: this.fileValidation.sanitizeFileName(file.originalname),
        fileType,
        mimeType: file.mimetype,
        fileSize: BigInt(uploadBuffer.length),
        storagePath: publicUrl,
        publicUrl,
        width,
        height,
        uploadedById: userId,
        entityType: entityType || null,
        entityId: entityId || null,
        tags: [],
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Convert BigInt to number for JSON serialization
    return {
      ...mediaFile,
      fileSize: Number(mediaFile.fileSize),
    };
  }

  /**
   * Get all media files with pagination
   */
  async findAll(page: number = 1, limit: number = 20, fileType?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (fileType) {
      where.fileType = fileType;
    }

    const total = await this.prisma.mediaFile.count({ where });

    const files = await this.prisma.mediaFile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Convert BigInt to number for JSON serialization
    const serializedFiles = files.map((file) => ({
      ...file,
      fileSize: Number(file.fileSize),
    }));

    return {
      data: serializedFiles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single media file
   */
  async findOne(id: string) {
    const file = await this.prisma.mediaFile.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException(`Media file with ID ${id} not found`);
    }

    return {
      ...file,
      fileSize: Number(file.fileSize),
    };
  }

  /**
   * Update media metadata
   */
  async updateMetadata(id: string, altText?: string, caption?: string, tags?: string[]) {
    await this.findOne(id); // Check exists

    const updated = await this.prisma.mediaFile.update({
      where: { id },
      data: {
        altText: altText || undefined,
        caption: caption || undefined,
        tags: tags || undefined,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return {
      ...updated,
      fileSize: Number(updated.fileSize),
    };
  }

  /**
   * Delete media file
   */
  async remove(id: string) {
    const file = await this.findOne(id);

    // Delete from R2
    await this.r2Storage.deleteFile(file.storagePath);

    // Delete from database
    await this.prisma.mediaFile.delete({
      where: { id },
    });

    return {
      message: 'Media file deleted successfully',
    };
  }

  /**
   * Get media statistics
   */
  async getStats() {
    const total = await this.prisma.mediaFile.count();
    const images = await this.prisma.mediaFile.count({
      where: { fileType: 'image' },
    });
    const documents = await this.prisma.mediaFile.count({
      where: { fileType: 'document' },
    });

    const totalSize = await this.prisma.mediaFile.aggregate({
      _sum: {
        fileSize: true,
      },
    });

    return {
      total,
      byType: {
        images,
        documents,
        other: total - images - documents,
      },
      totalSize: Number(totalSize._sum.fileSize || 0),
      totalSizeMB: Math.round(Number(totalSize._sum.fileSize || 0) / (1024 * 1024)),
    };
  }
}

