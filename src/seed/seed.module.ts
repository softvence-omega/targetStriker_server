import { Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { FolderServiceSeeder } from './services/folder.service';

@Module({
  providers: [AdminService, FolderServiceSeeder]
})
export class SeedModule {}
