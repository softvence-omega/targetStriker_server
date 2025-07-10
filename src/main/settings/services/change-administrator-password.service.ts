import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { ChangeAdminPassChangeDto } from '../dto/changePassword.dto';
import { LibService } from 'src/utils/lib/lib.service';
import { CommonService } from 'src/main/auth/services/common.service';

@Injectable()
export class ChangeAdministratorPasswordService {
  constructor(
    private readonly db: DbService,
    private readonly lib: LibService,
    private readonly commonService: CommonService, // Assuming commonService is a DbService instance
  ) {}
  async changeAdminPassword(
    email: string,
    changeAdminPassDto: ChangeAdminPassChangeDto,
  ) {
    const { password, newPassword } = changeAdminPassDto;

    // Find the admin user by email
    const adminUser = await this.db.user.findUnique({
      where: { email },
      include: { adminProfile: true },
    });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Verify the password using the lib service
    const isPasswordValid = await this.lib.comparePassword({
      hashedPassword: adminUser.password,
      password,
    });
    // If the password is not valid, throw an error
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    // Passowrd hashing
    const hashedPassword = await this.lib.hashPassword({
      password: newPassword,
      round: 6,
    });

    await this.db.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    const newToken = await this.commonService.generateToken({
      id: adminUser.id,
      email: adminUser.email,
      roles: 'ADMIN',
      isVerified: adminUser.isVerified,
      profileId: adminUser.adminProfile?.id ?? null,
    });

    return {
      message: 'Password changed successfully. Please log in again.',
      token: newToken,
    };
  }
}
