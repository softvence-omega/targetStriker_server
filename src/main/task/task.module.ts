import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { CommonService } from './services/common.service';
import { MainService } from './services/main.service';
import { SubmitService } from './services/submit.service';
import { TaskPhotoService } from './services/task-photo.service';

@Module({
  controllers: [TaskController],
  providers: [CommonService, MainService, SubmitService, TaskPhotoService]
})
export class TaskModule {}
