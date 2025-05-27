import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationEvent, NotificationJobPayload } from 'src/interfaces/notification';
import { NotificationGateway } from 'src/main/notification/notification.gateway';
import { DbService } from 'src/utils/db/db.service';
import {NotificationService as NotificationMain } from "src/main/notification/services/notification.service"
import validator from 'validator';


@Processor('notification')
export class NotificationService extends WorkerHost {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly db: DbService,
    private readonly NotificationMain: NotificationMain,
    private readonly notificationGateway: NotificationGateway,
  ) {
    super();
  }
   async process(job: Job<NotificationEvent>) {
    this.logger.debug(`Processing job ${job.id}...`);
    await this.saveNotification({
      userId: job.data.userId,
      title: job.data.title,
      body: job.data.body,
      data: job.data.data,
    });
    await this.NotificationMain.sendPushNotification({
      token: job.data.fcmToken,
      title: job.data.title,
      body: job.data.body,
      data: job.data.data,
      id: job.data.userId,
    });
    await this.notificationGateway.notifyUser(job.data.userId, {
      title: job.data.title,
      body: job.data.body,
      data: job.data.data,
    })
  }

    public async saveNotification(rawData: NotificationJobPayload) {
    const { userId, title, body, data } = rawData;

    if (!userId || !title || !body) {
      this.logger.error('Invalid job payload');
      return;
    }

    const isValidUUID = await this.validateUUID(userId);

    if (!isValidUUID) {
      this.logger.error(`Invalid UUID: ${userId}`);
      return;
    }

    try {
      const notification = await this.db.notification.create({
        data: {
         body,
          title,
          data,
          User:{
            connect: {
              id: userId
            }
          }
        },
      });
      this.logger.debug(`Notification saved: ${notification.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to save notification: ${error.message}`,
        error.stack,
      );
    }
  }

  validateUUID(id: string): boolean {
    if (!validator.isUUID(id)) {
      return false;
    }

    return true;
  }

  async onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed with error: ${error.message}`,
      error.stack,
    );
  }
}
