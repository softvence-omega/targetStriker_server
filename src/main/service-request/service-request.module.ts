import { Module } from '@nestjs/common';
import { CommonService } from './services/common.service';
import { MainService } from './services/main.service';
import { ServiceRequestController } from './service-request.controller';
import { AssignTaskService } from './services/assign-task.service';
import { MainService as InvoiceMainService } from 'src/main/invoice/services/main.service';
import { CommonService as InvoiceCommonService } from 'src/main/invoice/services/common.service';

@Module({
  providers: [CommonService, MainService, AssignTaskService, InvoiceMainService, InvoiceCommonService],
  controllers: [ServiceRequestController]
})
export class ServiceRequestModule {}
