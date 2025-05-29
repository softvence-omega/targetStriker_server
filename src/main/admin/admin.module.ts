import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { CommonService } from './services/common.service';

@Module({
  controllers: [AdminController],
  providers: [CommonService]
})
export class AdminModule {}
