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

    // Create user without any profile creation logic
    user = await this.db.user.create({
      data: { ...rawData },
    });

    const token = await this.commonService.generateToken({
      email: user.email,
      id: user.id,
      roles: user.UserType,
      isVerified: user.isVerified,
      profileId: null,
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
