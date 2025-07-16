import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

export const bankSeedData = {
  bankName: "TargetStriker Bank",
  IBAN: "DE89 3704 0044 0532 0130 00",
  BIC_or_SWIFT: "BIC12345XYZ",
};
@Injectable()
export class BankInfoSeedService implements OnModuleInit {
  private readonly logger = new Logger(BankInfoSeedService.name);

  constructor(private readonly dbService: DbService) {}

  async onModuleInit() {
    await this.seedBankInfo();
  }

  private async seedBankInfo() {
    const existing = await this.dbService.bankInfo.findFirst({
      where: { IBAN: bankSeedData.IBAN },
    });

    if (existing) {
      this.logger.log('ℹ️ Bank info already exists.');
      return;
    }

    await this.dbService.bankInfo.create({
      data: bankSeedData,
    });

    this.logger.log('✅ Bank info seeded successfully.');  }
}
