import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import { DbService } from 'src/utils/db/db.service';
import { TaskPhotoDto } from '../dto/taskPhoto.dto';
import { FileService } from 'src/utils/file/file.service';
import { ApiResponse } from 'src/common/types/apiResponse';
import { BooleanDto } from 'src/common/dto/boolean.dto';

@Injectable()
export class TaskPhotoService {
  constructor(
    private readonly db: DbService,
    private readonly file: FileService,
  ) {}

  public async create(
    id: IdDto,
    rawData: TaskPhotoDto,
  ): Promise<ApiResponse<any>> {
    try {
      const fileInstance = await this.file.processUploadedFile(rawData.pic);
      const data = await this.db.reportPhoto.create({
        data: {
          ServiceRequest: {
            connect: {
              id: id.id,
            },
          },
          pic: {
            connect: {
              id: fileInstance.id,
            },
          },
          caption: rawData.caption,
          isPrev: rawData.isPrev,
        },
      });

      return {
        success: true,
        data,
        message: 'Task photo created successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create task photo');
    }
  }

  async get(id: IdDto, isPrev: BooleanDto) {
    const data = await this.db.reportPhoto.findMany({
      where: {
        ServiceRequest: {
          id: id.id,
        },
        isPrev: isPrev.value || false ,
      },
      include:{
        pic:true
      }
    })

    return data
  }
}
