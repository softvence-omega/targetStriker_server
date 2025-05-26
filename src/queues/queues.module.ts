import { Module } from '@nestjs/common';
import { NotificationService } from './service/notification.service';


@Module({
  imports: [
    
  ],
  providers: [NotificationService],
})
export class QueuesModule {}
