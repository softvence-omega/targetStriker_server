import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { ServiceBeforAfterDto } from '../dto/serviceBeforAfter.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { FileService } from 'src/utils/file/file.service';

@Injectable()
export class AddServiceAfterBeforeService {
    constructor(private readonly dbService: DbService,private readonly file:FileService) {}

    async addServiceAfterBefore(
    id: IdDto,
    dto: ServiceBeforAfterDto,
  ) {

    // console.log(dto.isPrev)
   
    // return
    // return
    const fileInstance = await this.file.processUploadedFile(dto.pic,dto?.caption);
    // 1. Find the ServiceRequest
    const serviceRequest = await this.dbService.serviceRequest.findUnique({
      where: { id: id.id },
    });

    if (!serviceRequest) throw new NotFoundException('Service Request not found');

    // 2. Upload the file and create FileInstance
    // const uploadedFile = await this.dbService.fileInstance.create({
    //   data: dto.pic,
    // });

    // 3. Link the file as beforePhoto or afterPhoto
    if (dto.isPrev == true) {
      await this.dbService.serviceRequest.update({
        where: { id: id.id },
        data: {
          beforePhoto: {
            connect: { id: fileInstance.id },
          },
        },
      });
    } else if (dto.isPrev == false) {
      await this.dbService.serviceRequest.update({
        where: { id: id.id },
        data: {
          afterPhoto: {
            connect: { id: fileInstance.id },
          },
        },
      });
    } else {
      throw new Error('Invalid type: must be "before" or "after"');
    }

    return {
      success: true,
      message: 'Service after before added successfully',
      data: {
        ...fileInstance
      }
    };
  }
}
