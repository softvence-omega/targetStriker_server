import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class BankInfoSeedService implements OnModuleInit {
  private readonly logger = new Logger(BankInfoSeedService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedBankInfo();
  }

  private async seedBankInfo() {
    const bankName = this.config.getOrThrow('BANK_NAME');
    const iban = this.config.getOrThrow('BANK_IBAN');
    const swift = this.config.getOrThrow('BANK_SWIFT');

    const existing = await this.dbService.bankInfo.findFirst({
      where: { IBAN: iban },
    });

    if (existing) {
      this.logger.log('ℹ️ Bank info already exists.');
      return;
    }

    await this.dbService.bankInfo.create({
      data: {
        bankName,
        IBAN: iban,
        BIC_or_SWIFT: swift,
      },
    });

    this.logger.log('✅ Bank info seeded successfully.');
  }
}
