import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { FileService } from 'src/utils/file/file.service';
import { CreateServiceRequestDTO } from '../dto/serviceRequest.sto';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/common/types/apiResponse';

@Injectable()
export class MainService {
  constructor(
    private readonly db: DbService,
    private readonly file: FileService,
  ) {}

  async createServiceRequest(rawDate: CreateServiceRequestDTO, { id }: IdDto):Promise<ApiResponse<any>> {
    const {
      reqPhoto,
      name,
      taskTypeId,
      ...rest
    } = rawDate;

    if (!reqPhoto) {
      throw new BadRequestException('reqPhoto is required');
      
    }

    const file = await this.file.processUploadedFile(reqPhoto);

    try {
      const date = await this.db.serviceRequest.create({
        data: {
          reqPhoto: {
            connect: {
              id: file.id,
            },
          },
          name,
          ...rest,
          TaskType:{
            connect: {
              id: taskTypeId,
            },
          },
          ClientProfile: {
            connect: {
              id,
            },
          },
        },
        include:{
          reqPhoto:{
            select: {
              url: true
            }
          },
          tasks: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      });

      return {
        data: date,
        message: 'Service request created successfully',
        success: true,
      }
    } catch (error) {
      this.file.remove(file.id);
      throw new BadRequestException(`Failed to create service request\n ${error}`);
    }
  }
}
