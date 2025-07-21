import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { MainService } from './services/main.service';
import { CommonService } from '../service-request/services/common.service';
import { MyTaskService } from './services/my-task.service';
import { AddTaskService } from './services/add-task.service';
import { UpdateTaskService } from './services/update-task.service';
import { PaymentPendingService } from './services/payment-pending.service';
import { NonpriceSetTaskListService } from './services/nonprice-set-task-list.service';
import { WorkerTaskCompletedService } from './services/worker-task-completed.service';
import { WorkerTaskPuseService } from './services/worker-task-puse.service';
import { AddServicePriceBreakDownService } from './services/add-service-price-break-down.service';

@Module({
  controllers: [WorkerController],
  providers: [MainService, CommonService, MyTaskService, AddTaskService, UpdateTaskService, PaymentPendingService, NonpriceSetTaskListService, WorkerTaskCompletedService, WorkerTaskPuseService, AddServicePriceBreakDownService],
})
export class WorkerModule {}
