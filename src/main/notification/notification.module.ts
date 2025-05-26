import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { FirebaseService } from './services/firebase.service';

@Module({
  providers: [NotificationGateway, FirebaseService]
})
export class NotificationModule {}
