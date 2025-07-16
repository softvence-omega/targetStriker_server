import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { LibService } from 'src/utils/lib/lib.service';

const companySeedData = {
  name: "TargetStriker Ltd.",
  phone: "+880123456789",
  email: "info@targetstriker.com",
  city: "Dhaka",
  state: "Dhaka Division",
};
@Injectable()
export class CompanyService implements OnModuleInit {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly dbService: DbService,
  ) {}

  async onModuleInit() {
    await this.seedCompanyDetails();
  }

  private async seedCompanyDetails() {
    const companyExists = await this.dbService.companyDetails.findFirst({
      where: { email: companySeedData.email },
    });

    if (!companyExists) {
      await this.dbService.companyDetails.create({
        data: companySeedData,
      });

      this.logger.log('✅ Company details seeded successfully.');
    } else {
      this.logger.log('ℹ️ Company details already exist.');
    }
  }
}
