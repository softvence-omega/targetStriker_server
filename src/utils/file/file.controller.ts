import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { IdDto } from 'src/common/dto/id.dto';
import { FileType, MulterService } from '../lib/multer.service';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
  ) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', new MulterService().createMulterOptions('./temp', 'temp', FileType.ANY)),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.processUploadedFile(file);
  }

  @Delete('delete/:id')
  async deleteFile(@Param() { id }: IdDto) {
    return this.fileService.remove(id);
  }

}
