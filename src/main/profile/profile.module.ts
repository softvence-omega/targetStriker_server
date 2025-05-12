import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { CommonService } from './services/common.service';
import { CreateService } from './services/create.service';
import { UpdateService } from './services/update.service';
import { GetService } from './services/get.service';

@Module({
  controllers: [ProfileController],
  providers: [CommonService, CreateService, UpdateService, GetService]
})
export class ProfileModule {}
