import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums } from 'generated/prisma';
import { DbService } from 'src/utils/db/db.service';
import { LibService } from 'src/utils/lib/lib.service';

@Injectable()
export class CompanyService implements OnModuleInit {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly lib: LibService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedCompanyDetails(); // ✅ Seed company details
  }

  private async seedAdmin() {
    const adminExists = await this.dbService.user.findFirst({
      where: {
        UserType: {
          equals: $Enums.UserType.ADMIN,
        },
      },
    });

    if (!adminExists) {
      const hashedPassword = await this.lib.hashPassword({
        password: this.config.getOrThrow('ADMIN_PASSWORD'),
        round: 6,
      });

      await this.dbService.user.create({
        data: {
          email: this.config.getOrThrow('ADMIN_EMAIL'),
          name: this.config.getOrThrow('ADMIN_NAME'),
          password: hashedPassword,
          UserType: $Enums.UserType.ADMIN,
          phone: this.config.getOrThrow('ADMIN_PHONE'),
          isVerified: true,
          adminProfile: { create: {} },
        },
      });

      this.logger.log('✅ Super Admin user created.');
    } else {
      this.logger.log('ℹ️ Super Admin user already exists.');
    }
  }

  private async seedCompanyDetails() {
    const companyEmail = this.config.getOrThrow('COMPANY_EMAIL');
    const companyExists = await this.dbService.companyDetails.findFirst({
      where: { email: companyEmail },
    });

    if (!companyExists) {
      await this.dbService.companyDetails.create({
        data: {
          name: this.config.getOrThrow('COMPANY_NAME'),
          phone: this.config.getOrThrow('COMPANY_PHONE'),
          email: companyEmail,
          city: this.config.getOrThrow('COMPANY_CITY'),
          state: this.config.getOrThrow('COMPANY_STATE'),
        },
      });

      this.logger.log('✅ Company details seeded successfully.');
    } else {
      this.logger.log('ℹ️ Company details already exist.');
    }
  }
}
