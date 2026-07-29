import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

const uploadsRoot = join(process.cwd(), 'uploads');

function ensureUploadDir(folder: string) {
  const dir = join(uploadsRoot, folder);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_request, file, callback) => {
          const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
          callback(null, ensureUploadDir(folder));
        },
        filename: (_request, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          callback(null, `${Date.now()}-${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_request, file, callback) => {
        const allowed = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
        callback(allowed ? null : new BadRequestException('Only image and video files are allowed'), allowed);
      },
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  upload(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('File is required');
    const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
    return {
      url: `/uploads/${folder}/${file.filename}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
