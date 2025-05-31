import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { MainService } from './services/main.service';
import { CommonService } from './services/common.service';

@Module({
  controllers: [InvoiceController],
  providers: [MainService, CommonService]
})
export class InvoiceModule {}
