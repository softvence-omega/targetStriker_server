import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { NotificationModule } from './notification/notification.module';
import { TaskModule } from './task/task.module';
import { ServiceRequestModule } from './service-request/service-request.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    AuthModule,
    ProfileModule,
    NotificationModule,
    TaskModule,
    ServiceRequestModule,
    ChatModule,
  ],
})
export class MainModule {}
