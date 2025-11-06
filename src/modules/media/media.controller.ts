import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload file to R2 (admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entityType: {
          type: 'string',
          example: 'news',
        },
        entityId: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @Body('entityType') entityType?: string,
    @Body('entityId') entityId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.mediaService.uploadFile(file, user.id, entityType, entityId);
  }

  @Post('upload/multiple')
  @ApiOperation({ summary: 'Upload multiple files to R2 (admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const results = await Promise.all(
      files.map((file) => this.mediaService.uploadFile(file, user.id)),
    );

    return {
      message: `${results.length} files uploaded successfully`,
      files: results,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all media files with pagination (admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'fileType', required: false, enum: ['image', 'document'] })
  @ApiResponse({ status: 200, description: 'List of media files' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('fileType') fileType?: string,
  ) {
    return this.mediaService.findAll(page || 1, limit || 20, fileType);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get media statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Media statistics' })
  async getStats() {
    return this.mediaService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media file metadata (admin only)' })
  @ApiResponse({ status: 200, description: 'Media file details' })
  @ApiResponse({ status: 404, description: 'Media file not found' })
  async findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Patch(':id/metadata')
  @ApiOperation({ summary: 'Update media metadata (admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        altText: { type: 'string', example: 'Archer VTOL in flight' },
        caption: { type: 'string', example: 'Archer VTOL during border patrol mission' },
        tags: { type: 'array', items: { type: 'string' }, example: ['archer', 'vtol', 'aircraft'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Metadata updated successfully' })
  @ApiResponse({ status: 404, description: 'Media file not found' })
  async updateMetadata(
    @Param('id') id: string,
    @Body('altText') altText?: string,
    @Body('caption') caption?: string,
    @Body('tags') tags?: string[],
  ) {
    return this.mediaService.updateMetadata(id, altText, caption, tags);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media file from R2 and database (admin only)' })
  @ApiResponse({ status: 200, description: 'Media file deleted successfully' })
  @ApiResponse({ status: 404, description: 'Media file not found' })
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}

