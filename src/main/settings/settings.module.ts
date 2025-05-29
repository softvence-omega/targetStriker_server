import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { BankInfoService } from './services/bank-info.service';

@Module({
  controllers: [SettingsController],
  providers: [BankInfoService]
})
export class SettingsModule {}
