import { Module } from '@nestjs/common';
import { NotificationService } from './service/notification.service';
import { BullModule } from '@nestjs/bullmq';


@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  providers: [NotificationService],
})
export class QueuesModule {}
