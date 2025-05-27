import { Global, Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { FirebaseService } from './services/firebase.service';
import { EventService } from './services/event.service';
import { NotificationService } from './services/notification.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationController } from './notification.controller';

@Global()
@Module({
  providers: [NotificationGateway, FirebaseService, EventService, NotificationService, JwtService],
  exports:[NotificationService, NotificationGateway],
  controllers: [NotificationController]
})
export class NotificationModule {}
