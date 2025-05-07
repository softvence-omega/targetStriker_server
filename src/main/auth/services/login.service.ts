import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { LoginDto } from '../dto/login.dto';
import { LibService } from 'src/utils/lib/lib.service';
import { ApiResponse } from 'src/common/types/apiResponse';

@Injectable()
export class LoginService {
  constructor(
    private readonly commonService: CommonService,
    private readonly lib: LibService,
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

    const token = await this.commonService.generateToken({
      email: user.email,
      id: user.id,
      roles: user.UserType,
      isVerified: user.isVerified,
      profileId: profile?.id ?? null,
    });

    const cleanUser = {
      ...user,
      clientProfile: undefined,
      workerProfile: undefined,
      adminProfile: undefined,
      [`${user.UserType.toLowerCase()}Profile`]: profile,
    };
    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user:cleanUser,
      },
      statusCode: 200,
    };
  }
}
