import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { NotificationModule } from './notification/notification.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [AuthModule, ProfileModule, NotificationModule, TaskModule],
})
export class MainModule {}
