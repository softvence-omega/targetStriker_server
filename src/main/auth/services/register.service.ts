import { BadRequestException, Injectable } from '@nestjs/common';
import { CommonService } from './common.service';
import { RegisterDto } from '../dto/register.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { LibService } from 'src/utils/lib/lib.service';
import { DbService } from 'src/utils/db/db.service';
import { UserType } from 'generated/prisma';

@Injectable()
export class RegisterService {
  constructor(
    private readonly commonService: CommonService,
    private readonly lib: LibService,
    private readonly db: DbService,
  ) {}

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
        `User already exist with email:${rawData.email} or phone:${rawData.phone}`,
      );
    }

    rawData.password = await this.lib.hashPassword({
      password: rawData.password,
    });

    const profileIncludes = {
      [UserType.CLIENT]: { clientProfile: true },
    };

    const user = await this.db.user.create({
      data: {
        ...rawData,
        ...(rawData.UserType === 'CLIENT' && {
          clientProfile: {
            create: {},
          },
        }),
      },
      include: profileIncludes[rawData.UserType],
    });

    let profileId: string | null = null;

    if (rawData.UserType === 'CLIENT') {
      profileId = user.clientProfile?.id ?? null;
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
      statusCode: 201,
      success: true,
    };
  }
}
