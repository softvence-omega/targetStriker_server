import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { EVENT_TYPES } from 'src/interfaces/event';
import { NotificationEvent } from 'src/interfaces/notification';

@Injectable()
export class EventService {
  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  @OnEvent(EVENT_TYPES.NOTIFICATION_SEND)
  async sendNotification(rawData: NotificationEvent) {
    await this.notificationQueue.add('notification', rawData);
  }

  @OnEvent(EVENT_TYPES.BULK_NOTIFICATION_SEND)
  async sendBulkNotification(rawData: NotificationEvent[]) {
    await Promise.all(
      rawData.map((data) => this.notificationQueue.add('notification', data)),
    );
  }
}
