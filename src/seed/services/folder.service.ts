import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FolderServiceSeeder implements OnModuleInit  {
    private readonly logger = new Logger(FolderServiceSeeder.name);

  async onModuleInit() {
    this.ensureDirectoriesExist(['uploads', 'temp']);
    // You can call other seed functions here
  }

  private ensureDirectoriesExist(folders: string[]) {
    for (const folder of folders) {
      const fullPath = path.join(process.cwd(), folder);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        this.logger.log(`Created missing folder: ${fullPath}`);
      } else {
        this.logger.log(`Folder already exists: ${fullPath}`);
      }
    }
  }
}
