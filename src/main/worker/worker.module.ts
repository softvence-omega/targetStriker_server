import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { MainService } from './services/main.service';
import { CommonService } from '../service-request/services/common.service';

@Module({
  controllers: [WorkerController],
  providers: [MainService, CommonService]
})
export class WorkerModule {}
