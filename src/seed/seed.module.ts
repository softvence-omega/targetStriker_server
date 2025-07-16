import { Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { FolderServiceSeeder } from './services/folder.service';
import { WorkerSpecialistTypeService } from './services/worker-specialist-type.service';
import { TaskTypeService } from './services/task-type.service';
import { SettingService } from './services/setting.service';
import { BankInfoSeedService } from './services/bank.service';
import { CompanyService } from './services/company.service';

@Module({
  providers: [AdminService, FolderServiceSeeder, WorkerSpecialistTypeService, TaskTypeService, SettingService, BankInfoSeedService,CompanyService ]
})
export class SeedModule {}
