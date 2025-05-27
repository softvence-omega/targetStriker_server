import { Global, Module } from '@nestjs/common';
import { NotificationService } from './service/notification.service';
import { BullModule } from '@nestjs/bullmq';


@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  exports:[BullModule],
  providers: [NotificationService],
})
export class QueuesModule {}
