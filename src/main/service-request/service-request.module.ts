import { Module } from '@nestjs/common';
import { CommonService } from './services/common.service';
import { MainService } from './services/main.service';

@Module({
  providers: [CommonService, MainService]
})
export class ServiceRequestModule {}
