import { BadRequestException, Injectable } from '@nestjs/common';
import { CommonService } from './common.service';
import { RegisterDto } from '../dto/register.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { LibService } from 'src/utils/lib/lib.service';
import { DbService } from 'src/utils/db/db.service';
import { UserType, User } from 'generated/prisma';

@Injectable()
export class RegisterService {
  constructor(
    private readonly commonService: CommonService,
    private readonly lib: LibService,
    private readonly db: DbService,
  ) { }

  public async register(rawData: RegisterDto): Promise<ApiResponse<any>> {
    const isExist = await this.commonService.isUserExistByEmailOrPhone({
      email: rawData.email,
      phone: rawData.phone,
    });

    if (rawData.UserType === 'ADMIN') {
      throw new BadRequestException('Admin is not allowed to register');
    }

    if (isExist) {
      throw new BadRequestException(
        `User already exists with email: ${rawData.email} or phone: ${rawData.phone}`,
      );
    }

    rawData.password = await this.lib.hashPassword({
      password: rawData.password,
    });

    let user: any;
    let profileId: string | null = null;

    // Create user with the appropriate profile based on UserType
    if (rawData.UserType === 'CLIENT') {
      const generatedUserName = `${rawData.email.split('@')[0]}-${Date.now()}`;

      user = await this.db.user.create({
        data: {
          ...rawData,
          clientProfile: {
            create: {
              location: '', // default empty location
              userName: generatedUserName, // ensure uniqueness
            },
          },
        },
        include: { clientProfile: true },
      });

      profileId = user.clientProfile?.id ?? null;
    } else if (rawData.UserType === 'WORKER') {
      const generatedWorkerId = `W-${Date.now()}`; // make sure this is unique
      const generatedUserName = `${rawData.email.split('@')[0]}-${Date.now()}`;

      user = await this.db.user.create({
        data: {
          ...rawData,
          workerProfile: {
            create: {
              userName: generatedUserName,
              workerId: generatedWorkerId,
              location: {}, // pass an empty object or a valid location structure
            },
          },
        },
        include: { workerProfile: true },
      });

      profileId = user.workerProfile?.id ?? null
    }
    else {
      user = await this.db.user.create({
        data: { ...rawData },
      });
    }

    const token = await this.commonService.generateToken({
      email: user.email,
      id: user.id,
      roles: user.UserType,
      isVerified: user.isVerified,
      profileId,
    });

    return {
      data: {
        token,
        user,
      },
      message: 'User registered successfully',
      success: true,
    };
  }
}
