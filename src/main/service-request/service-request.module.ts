import { Module } from '@nestjs/common';
import { CommonService } from './services/common.service';
import { MainService } from './services/main.service';
import { ServiceRequestController } from './service-request.controller';
import { AssignTaskService } from './services/assign-task.service';

@Module({
  providers: [CommonService, MainService, AssignTaskService],
  controllers: [ServiceRequestController]
})
export class ServiceRequestModule {}
