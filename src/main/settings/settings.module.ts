import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { BankInfoService } from './services/bank-info.service';
import { ChangeAdministratorPasswordService } from './services/change-administrator-password.service';

@Module({
  controllers: [SettingsController],
  providers: [BankInfoService, ChangeAdministratorPasswordService],
})
export class SettingsModule {}
