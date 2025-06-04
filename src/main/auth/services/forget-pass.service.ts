import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/types/apiResponse';
import { CodeService } from 'src/utils/code/code.service';
import { DbService } from 'src/utils/db/db.service';
import { LibService } from 'src/utils/lib/lib.service';
import { SendResetCodeDto } from '../dto/VerifyCodeOnly.Dto';
import { ResetPasswordDto } from '../dto/resetPassword.dto';

@Injectable()
export class ForgetPassService {
  constructor(
    private readonly db: DbService,
    private readonly lib: LibService,
    private readonly code: CodeService,
  ) {}

  async sendPasswordResetCode({
    email,
  }: SendResetCodeDto): Promise<ApiResponse<null>> {
    // Check if user exists
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException(
        'No account found with this email address',
        HttpStatus.NOT_FOUND,
      );
    }

    // Generate and send password reset code
    await this.code.sendPasswordResetEmail(
      email,
      30, // 30 minutes expiration
      {
        username: user.name,
        applicationName: 'Your Application',
      },
    );

    return {
      success: true,
      message: 'Password reset code has been sent to your email',
      data: null,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<ApiResponse<null>> {
    const { email, newPassword, code } = dto;

    // Check if user exists
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException(
        'No account found with this email address',
        HttpStatus.NOT_FOUND,
      );
    }

    // Verify password reset code
    const isCodeValid = await this.code.verifyCode(email, code);

    if (!isCodeValid) {
      throw new HttpException(
        'Invalid password reset code',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Hash the new password
    const hashedPassword = await this.lib.hashPassword({
      password: newPassword,
      round: 10,
    });

    // Update the user's password
    await this.db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      message:
        'Password has been reset successfully. You can now login with your new password.',
      data: null,
    };
  }
}
