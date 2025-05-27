import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { DbService } from 'src/utils/db/db.service';
import { SendNotificationDto } from '../dto/sendNotification.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { CursorDto } from 'src/common/dto/cursor.dto';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name)
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly db: DbService,
  ) {}

  async sendPushNotification({
    token,
    title,
    body,
    data,
  }: SendNotificationDto) {
    try {
      const message = {
        token,
        notification: {
          title,
          body,
        },
        data: data || {},
      };

      const response = await this.firebaseService.getMessaging().send(message);
      this.logger.debug(`Push notification sent: ${response}`);
    } catch (error) {
      this.logger.error(`Error sending push notification: ${error}`);
    }
  }

  public async getNotification({ id }: IdDto,{ cursor, take }: CursorDto): Promise<ApiResponse<any>> {
    
    const data = await this.db.notification.findMany({
      where: {
        userId: id,
      },
      take,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });
    return {
      data,
      message: 'Notifications fetched successfully',
      success: true,
    };
  }
}
