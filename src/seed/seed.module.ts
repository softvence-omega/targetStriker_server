import { Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { FolderServiceSeeder } from './services/folder.service';
import { WorkerSpecialistTypeService } from './services/worker-specialist-type.service';
import { TaskTypeService } from './services/task-type.service';

@Module({
  providers: [AdminService, FolderServiceSeeder, WorkerSpecialistTypeService, TaskTypeService]
})
export class SeedModule {}
