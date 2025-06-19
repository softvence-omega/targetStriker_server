import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums } from 'generated/prisma';
import { DbService } from 'src/utils/db/db.service';
import { LibService } from 'src/utils/lib/lib.service';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    private readonly dbService: DbService,
    private readonly lib: LibService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.seedAdmin();
  }

  async seedAdmin() {
    const adminExists = await this.dbService.user.findFirst({
      where: {
        UserType: {
          equals: $Enums.UserType.ADMIN,
        },
      },
    });

    if (!adminExists) {
      const hashedPassword = await this.lib.hashPassword({
        password: this.config.getOrThrow('ADMIN_PASSWORD') as string,
        round: 6,
      });
      await this.dbService.user.create({
        data: {
          email: this.config.getOrThrow('ADMIN_EMAIL') as string,
          name: this.config.getOrThrow('ADMIN_NAME') as string,
          password: hashedPassword,
          UserType: $Enums.UserType.ADMIN,
          phone: this.config.getOrThrow('ADMIN_PHONE') as string,
          isVerified: true,
          adminProfile: { create: {} },
        },
      });
      this.logger.log('Super Admin user created successfully.');
    } else {
      this.logger.log('Super Admin user already exists.');
    }
  }
}
