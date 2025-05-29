import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { NotificationModule } from './notification/notification.module';
import { TaskModule } from './task/task.module';
import { ServiceRequestModule } from './service-request/service-request.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { MetaModule } from './meta/meta.module';
import { WorkerModule } from './worker/worker.module';
import { SettingsModule } from './settings/settings.module';

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
    WorkerModule,
    SettingsModule,
  ],
})
export class MainModule {}
