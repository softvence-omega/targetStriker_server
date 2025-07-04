import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { MainService } from './services/main.service';
import { CommonService } from './services/common.service';
import { GetInvoiceOverviewService } from './services/get-invoice-overview.service';
import { ChangeInvoiceStatusService } from './services/change-invoice-status.service';

@Module({
  controllers: [InvoiceController],
  providers: [MainService, CommonService, GetInvoiceOverviewService, ChangeInvoiceStatusService]
})
export class InvoiceModule {}
