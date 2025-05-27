import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { CommonService } from './services/common.service';
import { MainService } from './services/main.service';

@Module({
  controllers: [TaskController],
  providers: [CommonService, MainService]
})
export class TaskModule {}
