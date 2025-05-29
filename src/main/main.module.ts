import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { NotificationModule } from './notification/notification.module';
import { TaskModule } from './task/task.module';
import { ServiceRequestModule } from './service-request/service-request.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { MetaModule } from './meta/meta.module';

@Module({
  imports: [
    AuthModule,
    ProfileModule,
    NotificationModule,
    TaskModule,
    ServiceRequestModule,
    ChatModule,
    AdminModule,
    MetaModule,
  ],
})
export class MainModule {}
