import {
  BadRequestException,
  InternalServerErrorException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

const IMAGE_UPLOAD_LIMIT = 10 * 1024 * 1024;
const VIDEO_UPLOAD_LIMIT = 50 * 1024 * 1024;

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_request, file, callback) => {
        const allowed = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
        callback(allowed ? null : new BadRequestException('Only image and video files are allowed'), allowed);
      },
      limits: {
        fileSize: VIDEO_UPLOAD_LIMIT,
        files: 1,
        fields: 0,
        parts: 1,
        fieldNameSize: 100,
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    this.ensureCloudinaryConfig();

    const isVideo = file.mimetype.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';
    this.validateUpload(file, isVideo);

    const folder = `${this.config.get<string>('CLOUDINARY_FOLDER') || 'khan'}/${isVideo ? 'videos' : 'images'}`;
    const result = await this.uploadBuffer(file.buffer, folder, resourceType);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  private validateUpload(file: Express.Multer.File, isVideo: boolean) {
    const limit = isVideo ? VIDEO_UPLOAD_LIMIT : IMAGE_UPLOAD_LIMIT;
    if (file.size > limit) {
      throw new BadRequestException(
        `File is too large. Maximum ${isVideo ? 'video' : 'image'} size is ${limit / 1024 / 1024}MB`,
      );
    }

    if (isVideo ? !this.hasVideoSignature(file.buffer) : !this.hasImageSignature(file.buffer)) {
      throw new BadRequestException('File content does not match the declared media type');
    }
  }

  private hasImageSignature(buffer: Buffer) {
    return (
      buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ||
      buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
      buffer.subarray(0, 6).toString('ascii') === 'GIF87a' ||
      buffer.subarray(0, 6).toString('ascii') === 'GIF89a' ||
      (buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP')
    );
  }

  private hasVideoSignature(buffer: Buffer) {
    return (
      buffer.subarray(4, 8).toString('ascii') === 'ftyp' ||
      buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])) ||
      buffer.subarray(0, 4).toString('ascii') === 'OggS' ||
      (buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'AVI ')
    );
  }

  private uploadBuffer(
    buffer: Buffer,
    folder: string,
    resourceType: 'image' | 'video',
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Cloudinary upload failed'));
            return;
          }
          resolve(result);
        },
      );

      stream.end(buffer);
    }).catch((error) => {
      throw new InternalServerErrorException(error.message || 'Cloudinary upload failed');
    });
  }

  private ensureCloudinaryConfig() {
    const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missing = required.filter((key) => !this.config.get<string>(key));
    if (missing.length) {
      throw new InternalServerErrorException(`Missing Cloudinary config: ${missing.join(', ')}`);
    }
  }
}
