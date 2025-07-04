import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { FileService } from 'src/utils/file/file.service';
import { IdDto } from 'src/common/dto/id.dto';
import { UpdateClientProfileDto } from '../dto/updateClientProfile.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { FileInstance } from 'generated/prisma';
import { CommonService } from 'src/main/auth/services/common.service';
import { UpdateWorkerProfileDto } from '../dto/updateWorkerProfile.dto';

@Injectable()
export class UpdateService {
  constructor(
    private readonly db: DbService,
    private readonly fileService: FileService,
    private readonly commonService: CommonService,
  ) { }

public async updateClientProfile(
  { id }: IdDto,
  rawData: UpdateClientProfileDto,
): Promise<ApiResponse<any>> {
  console.log('[Service] Searching clientProfile with userId:', id);

  // Find by userId because userId is unique and links profile to user
  const existingProfile = await this.db.clientProfile.findUnique({
    where: { id },
    include: {
      profilePic: true,
      User: true,
    },
  });


  if (!existingProfile) {
    throw new NotFoundException(`Client profile for User ID ${id} not found`);
  }

  if (!existingProfile.User) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  let fileInstance: FileInstance | null = null;
  let oldFileId: string | undefined = undefined;

  if (rawData.profilePic) {
    console.log('[Service] Processing uploaded file...');
    fileInstance = await this.fileService.processUploadedFile(rawData.profilePic);
    oldFileId = existingProfile.profilePic?.id;
    console.log('[Service] New file processed with ID:', fileInstance.id);
    console.log('[Service] Old profilePic ID:', oldFileId);
  } else {
    console.log('[Service] No new profilePic to process');
  }

  try {
    const updateData: any = {};

    if (rawData.location !== undefined) {
      updateData.location = rawData.location;
      
    }
    if (rawData.userName !== undefined) {
      updateData.userName = rawData.userName;
      
    }
    if (fileInstance) {
      updateData.profilePic = {
        connect: { id: fileInstance.id },
      };
      
    }

    const data = await this.db.clientProfile.update({
      where: { id: existingProfile.id }, // <-- Use profile's own id here!
      data: updateData,
      include: { profilePic: true },
    });


    if (oldFileId && fileInstance) {
      await this.fileService.remove(oldFileId);
    }

    const tokenPayload = {
      email: existingProfile.User.email,
      id: existingProfile.User.id,
      roles: existingProfile.User.UserType,
      isVerified: existingProfile.User.isVerified,
      profileId: data.id,
    };
    const token = await this.commonService.generateToken(tokenPayload);

    return {
      success: true,
      message: 'Client profile updated successfully',
      data: {
        data,
        token,
      },
    };
  } catch (error) {
    if (fileInstance) {
      await this.fileService.remove(fileInstance.id);
    }
    throw new BadRequestException(`Failed to update client profile\n${error}`);
  }
}


  public async updateWorkerProfile(
    { id }: IdDto,
    rawData: UpdateWorkerProfileDto,
  ): Promise<ApiResponse<any>> {
    // Check if worker profile exists
    const existingProfile = await this.db.workerProfile.findUnique({
      where: { id },
      include: {
        profilePic: true,
        User: true,
        WorkerSpecialist: true,
      },
    });

    if (!existingProfile) {
      throw new NotFoundException(`Worker profile with ID ${id} not found`);
    }

    if (!existingProfile.User) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    let fileInstance: FileInstance | null = null;
    let oldFileId: string | undefined = undefined;

    // Handle file update if provided
    if (rawData.profilePic) {
      fileInstance = await this.fileService.processUploadedFile(
        rawData.profilePic,
      );
      oldFileId = existingProfile.profilePic?.id;
    }

    try {
      // Prepare update data
      const updateData: any = {};

      if (rawData.location !== undefined) {
        updateData.location = rawData.location;
      }
      if (rawData.userName !== undefined) {
        updateData.userName = rawData.userName;
      }
      if (rawData.workerId !== undefined) {
        updateData.workerId = rawData.workerId;
      }
      if (rawData.workerSpecialtyId !== undefined) {
        updateData.WorkerSpecialist = {
          connect: {
            id: rawData.workerSpecialtyId
          }
        };
      }
      if (fileInstance) {
        updateData.profilePic = {
          connect: {
            id: fileInstance.id,
          },
        };
      }

      const data = await this.db.workerProfile.update({
        where: { id },
        data: updateData,
        include: {
          profilePic: true,
          WorkerSpecialist: true,
        },
      });

      // Remove old file if new one was uploaded
      if (oldFileId && fileInstance) {
        await this.fileService.remove(oldFileId);
      }

      return {
        success: true,
        message: 'Worker profile updated successfully',
        data: {
          data,
          token: await this.commonService.generateToken({
            email: existingProfile.User.email,
            id: existingProfile.User.id,
            roles: existingProfile.User.UserType,
            isVerified: existingProfile.User.isVerified,
            profileId: data.id
          })
        },
      };
    } catch (error) {
      // Clean up new file if update failed
      if (fileInstance) {
        await this.fileService.remove(fileInstance.id);
      }
      throw new BadRequestException(
        `Failed to update worker profile\n${error}`,
      );
    }
  }
}
