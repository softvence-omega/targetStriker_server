import { BadRequestException, Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/common/types/AuthenticatedRequest';
import { CursorDto } from 'src/common/dto/cursor.dto';
import { SendNotificationDto } from './dto/sendNotification.dto';
import { EventService } from 'src/utils/event/event.service';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
     private readonly eventEmitter: EventService
) {}

  @Post('send')
  async sendNotification(@Body() data: SendNotificationDto) {
   await this.eventEmitter.emit('NOTIFICATION_SEND', {
     fcmToken: data.token,
     title: data.title,
     body: data.body,
     data: data.data,
     userId: data.id
   });

   return { success: true, message: 'Notification sent successfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('get')
  @ApiBearerAuth()
  async getNotification(
    @Req() req: AuthenticatedRequest,
    @Query() rawDate: CursorDto,
  ) {
    if (!req.user.sub) {
      throw new BadRequestException('Profile not Created');
    }
    return this.notificationService.getNotification(
      { id: req.user.sub },
      rawDate,
    );
  }
}
