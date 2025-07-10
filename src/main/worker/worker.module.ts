import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { MainService } from './services/main.service';
import { CommonService } from '../service-request/services/common.service';
import { MyTaskService } from './services/my-task.service';

@Module({
  controllers: [WorkerController],
  providers: [MainService, CommonService, MyTaskService],
})
export class WorkerModule {}
