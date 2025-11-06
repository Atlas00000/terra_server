import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { R2StorageService } from './services/r2-storage.service';
import { ImageOptimizationService } from './services/image-optimization.service';
import { FileValidationService } from './services/file-validation.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MediaController],
  providers: [
    MediaService,
    R2StorageService,
    ImageOptimizationService,
    FileValidationService,
  ],
  exports: [MediaService],
})
export class MediaModule {}

