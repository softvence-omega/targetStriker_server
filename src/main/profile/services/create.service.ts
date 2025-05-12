import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { CreateClientProfileDto } from '../dto/createClientProfile.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { CommonService as UserCommonService } from 'src/main/auth/services/common.service';
import { ApiResponse } from 'src/common/types/apiResponse';
import { FileService } from 'src/utils/file/file.service';

@Injectable()
export class CreateService {
  constructor(
    private readonly db: DbService,
    private readonly UserCommonService: UserCommonService,
    private readonly fileService: FileService
  ) {}

  public async createClientProfile(
    { id }: IdDto,
    rawData: CreateClientProfileDto,
  ): Promise<ApiResponse<any>> {
    const isExist = await this.UserCommonService.isUserExit({ id });

    if (!isExist) {
      throw new BadRequestException(`User with ID ${id} not found`);
    }

    const fileInstance = await this.fileService.processUploadedFile(
      rawData.profilePic,
    );

    try {
      const data = await this.db.clientProfile.create({
        data: {
          location: rawData.location,
          userName: rawData.userName,
          profilePic:{
            connect:{
              id: fileInstance.id
            }
          },
          User: {
            connect: {
              id,
            },
          },
        },
        include:{
          profilePic: true
        }
      });

      return {
        success: true,
        message: 'Client profile created successfully',
        data,
        statusCode: 201,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create client profile\n${error}`,
      );
    }
  }
}
