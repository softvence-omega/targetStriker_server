import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { FirebaseGateway } from './services/firebase.gateway';

@Module({
  providers: [NotificationGateway, FirebaseGateway]
})
export class NotificationModule {}
