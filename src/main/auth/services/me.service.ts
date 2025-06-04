import { Injectable, NotFoundException } from '@nestjs/common';
import { CommonService } from './common.service';
import { DbService } from 'src/utils/db/db.service';
import { ApiResponse } from 'src/common/types/apiResponse';

@Injectable()
export class MeService {
  constructor(
    private readonly commonService: CommonService,
    private dbService: DbService,
  ) {}

  async getMe(email: string): Promise<ApiResponse<any>> {
    const user = await this.commonService.isUserExistByEmail({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile =
      user.UserType === 'CLIENT'
        ? user.clientProfile
        : user.UserType === 'WORKER'
          ? user.workerProfile
          : user.UserType === 'ADMIN'
            ? user.adminProfile
            : null;

    // Check if profile is created based on user type
    const isProfileCreated = this.commonService.checkProfileCreated(user.UserType, profile);

    const cleanUser = {
      ...(this.dbService.exclude(user, ["password"])),
      clientProfile: undefined,
      workerProfile: undefined,
      adminProfile: undefined,
      [`${user.UserType.toLowerCase()}Profile`]: profile,
      isProfileCreated,
    };

    return {
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: cleanUser,
      },
    };
  }
}
