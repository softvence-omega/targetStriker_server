import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { LoginDto } from '../dto/login.dto';
import { LibService } from 'src/utils/lib/lib.service';
import { ApiResponse } from 'src/common/types/apiResponse';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class LoginService {
  constructor(
    private readonly commonService: CommonService,
    private readonly lib: LibService,
    private dbService: DbService
  ) {}

  async login(rawData: LoginDto): Promise<ApiResponse<any>> {
    const { email, password } = rawData;

    const user = await this.commonService.isUserExistByEmail({ email });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const isPasswordMatch = await this.lib.comparePassword({
      password,
      hashedPassword: user.password,
    });

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Password does not match');
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

    const token = await this.commonService.generateToken({
      email: user.email,
      id: user.id,
      roles: user.UserType,
      isVerified: user.isVerified,
      profileId: profile?.id ?? null,
    });

    const cleanUser = {
      ...(this.dbService.exclude(user, ['password'])),
      clientProfile: undefined,
      workerProfile: undefined,
      adminProfile: undefined,
      [`${user.UserType.toLowerCase()}Profile`]: profile,
      isProfileCreated,
    };

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: cleanUser,
      },
    };
  }
}
