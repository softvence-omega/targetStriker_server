import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [AuthModule, ProfileModule, NotificationModule],
})
export class MainModule {}
