import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateFileDto } from './dto/createFile.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  constructor(
    private readonly dbService: DbService,
    private readonly configService: ConfigService
  ) {}

  async create(createFileDto: CreateFileDto) {
    try {
      const file = await this.dbService.fileInstance.create({
        data: createFileDto,
      });
      return file;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create file record');
    }
  }

  async findOne(id: string) {
    const file = await this.dbService.fileInstance.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  async findByFilename(filename: string) {
    const file = await this.dbService.fileInstance.findFirst({
      where: { filename },
    });

    if (!file) {
      throw new NotFoundException(`File ${filename} not found`);
    }

    return file;
  }

  async remove(id: string): Promise<void> {
    const file = await this.findOne(id);
    
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.warn(`Could not delete physical file at ${file.path}:`, error);
      throw new BadRequestException('Could not delete physical file');
    }

    await this.dbService.fileInstance.delete({
      where: { id },
    });
  }

  async processUploadedFile(file: Express.Multer.File,caption?:string) {
    try {
      const fileId = uuidv4();
      const fileExt = path.extname(file.originalname);
      const filename = `${fileId}${fileExt}`;
      
      const mimeType =
        file.mimetype || mime.lookup(file.originalname) || 'application/octet-stream';
      const fileType = mimeType.split('/')[0] || 'unknown';

      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);

      // ✅ ServeStatic change: file will be accessible via `/files/<filename>`
      const fileUrl = `${this.configService.getOrThrow("BASE_URL")}/files/${filename}`;

      if (file.path && file.path !== filePath) {
        fs.copyFileSync(file.path, filePath);
        fs.unlinkSync(file.path);
      }

      const createFileDto: CreateFileDto = {
        filename,
        originalFilename: file.originalname,
        path: filePath,
        url: fileUrl,
        fileType,
        mimeType,
        size: file.size,
        caption
      };

      return this.create(createFileDto);
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      throw new InternalServerErrorException('Failed to process uploaded file');
    }
  }
}
