import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { AssignTaskDto } from '../dto/assignTask.dto';
import { CommonService } from './common.service';
import { ApiResponse } from 'src/common/types/apiResponse';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GetAssignedServiceRequestDto } from '../dto/getAssignedServiceRequest.dto';
import { MainService } from 'src/main/invoice/services/main.service';
import { EventService } from 'src/main/notification/services/event.service';
import { ChatListGateway } from 'src/main/chat/ws/chat-list.gateway';
import { NotificationGateway } from 'src/main/notification/notification.gateway';

@Injectable()
export class AssignTaskService {
  private readonly logger = new Logger(AssignTaskService.name);
  constructor(
    private readonly db: DbService,
    private readonly commonService: CommonService,
    private readonly mainService: MainService,
    private readonly chatListService: ChatListGateway,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  private async ensureConversation(userId1: string, userId2: string) {
    const existingConversation = await this.db.conversation.findFirst({
      where: {
        OR: [
          { memberOneId: userId1, memberTwoId: userId2 },
          { memberOneId: userId2, memberTwoId: userId1 },
        ],
      },
    });

    if (!existingConversation) {
      await this.db.conversation.create({
        data: {
          memberOne: { connect: { id: userId1 } },
          memberTwo: { connect: { id: userId2 } },
        },
      });
    }
  }

  public async assignTask({ taskId, workerId }: AssignTaskDto): Promise<ApiResponse<any>> {
  const isExist = await this.commonService.findServiceRequest({ id: taskId });

  if (!isExist) {
    throw new BadRequestException('Service request not found');
  }

  const data = await this.db.serviceRequest.update({
    where: { id: taskId },
    data: {
      WorkerProfile: { connect: { id: workerId } },
      status: 'ASSIGNED',
    },
    include: {
      WorkerProfile: {
        select: {
          userId: true,
          profilePic: true,
          userName: true,
        },
      },
      ClientProfile: {
        select: {
          userId: true,
          profilePic: true,
          userName: true,
        },
      },
      AdminProfile: {
        select: {
          userId: true,
          profilePic: true,
          User:true,
        },
      },
    },
  });

  if (!data.WorkerProfile?.userId) {
    throw new BadRequestException('Worker profile ID is missing');
  }

  const creatorProfile = data.ClientProfile ?? data.AdminProfile;
  const creatorRole = data.ClientProfile ? 'CLIENT' : 'ADMIN';

  if (!creatorProfile?.userId) {
    throw new BadRequestException('Creator profile user ID is missing');
  }

  try {
    // Create conversation between client/admin and worker
    const existingConversation = await this.db.conversation.findFirst({
      where: {
        OR: [
          {
            memberOneId: creatorProfile.userId,
            memberTwoId: data.WorkerProfile.userId,
          },
          {
            memberOneId: data.WorkerProfile.userId,
            memberTwoId: creatorProfile.userId,
          },
        ],
      },
    });

    if (!existingConversation) {
      await this.db.conversation.create({
        data: {
          memberOne: { connect: { id: creatorProfile.userId } },
          memberTwo: { connect: { id: data.WorkerProfile.userId } },
        },
      });
    }

    // Create conversations with admin
    const admin = await this.db.user.findFirst({
      where: { UserType: 'ADMIN' },
      select: { id: true },
    });

    if (admin) {
      const participants = [creatorProfile.userId, data.WorkerProfile.userId];

      for (const participantId of participants) {
        const adminConversation = await this.db.conversation.findFirst({
          where: {
            OR: [
              { memberOneId: participantId, memberTwoId: admin.id },
              { memberOneId: admin.id, memberTwoId: participantId },
            ],
          },
        });

        if (!adminConversation) {
          await this.db.conversation.create({
            data: {
              memberOne: { connect: { id: participantId } },
              memberTwo: { connect: { id: admin.id } },
            },
          });
        }
      }

      // Broadcast chat updates
      await this.chatListService.broadcastChatListUpdate(creatorProfile.userId);
      await this.chatListService.broadcastChatListUpdate(data.WorkerProfile.userId);
      await this.chatListService.broadcastChatListUpdate(admin.id);
    }

    // ✅ Send WebSocket notifications
    try {
      await this.notificationGateway.notifyUser(creatorProfile.userId, {
        type: 'TASK_ASSIGNED',
        payload: {
          taskId: data.id,
          tastName: data.name,
          workerProfile: data.WorkerProfile.profilePic,
          workerName: data.WorkerProfile.userName,
          role: creatorRole,
          message: 'A worker has been assigned to your request.',
        },
      });

      await this.notificationGateway.notifyUser(data.WorkerProfile.userId, {
        type: 'TASK_ASSIGNED',
        payload: {
          taskId: data.id,
          tastName: data.name,
          role: 'WORKER',
          clientName:  creatorRole === 'CLIENT' ? data.ClientProfile?.userName : data?.AdminProfile?.User?.name,
          clientProfile: creatorProfile.profilePic,
          message: 'You have been assigned a new service request.',
        },
      });

      // Persist notification for creator
      await this.saveNotification({
        userId: creatorProfile.userId,
        title: 'Worker Assigned',
        body: 'A worker has been assigned to your service request.',
        data: {
          taskId: data.id,
          taskName: data.name,
          workerId: data.WorkerProfile.userId,
          workerName: data.WorkerProfile.userName,
          workerProfile: data.WorkerProfile.profilePic,
        },
      });

      // Persist notification for worker
      await this.saveNotification({
        userId: data.WorkerProfile.userId,
        title: 'New Task Assigned',
        body: 'You have been assigned a new service request.',
        data: {
          taskId: data.id,
          taskName: data.name,
          clientId: creatorProfile.userId,
          clientName: creatorRole === 'CLIENT' ? data.ClientProfile?.userName : data?.AdminProfile?.User?.name,
          clientProfile: creatorProfile.profilePic,
        },
      });
    } catch (error) {
      this.logger.error('Error sending notifications to client/admin/worker:', error);
    }

  } catch (error) {
    this.logger.error('Error creating conversation or sending notifications:', error);
  }

  return {
    data,
    message: 'Task assigned successfully',
    success: true,
  };
}

  public async getAssignedServiceRequest(
    { id }: IdDto,
    { take, skip }: GetAssignedServiceRequestDto,
  ): Promise<ApiResponse<any>> {
    const isUserExist = await this.db.user.findFirst({
      where: {
        workerProfile: {
          id: id,
        },
      },
    });

    if (!isUserExist) {
      throw new BadRequestException('User not found');
    }

    const data = await this.db.serviceRequest.findMany({
      where: {
        WorkerProfile: {
          id,
        },
        // Add date filter - assuming you have a createdAt or scheduledDate field
      },
      take,
      skip,
    });

    return {
      data,
      message: 'Service requests fetched successfully',
      success: true,
    };
  }

  public async confirmServiceRequest(
  { id: clientProfileId }: IdDto,
  id: string,
): Promise<ApiResponse<any>> {
  const serviceRequest = await this.db.serviceRequest.update({
    where: {
      id,
      workerProfileId: {
        not: null,
      },
    },
    data: {
      status: 'CONFIRMED',
    },
    include: {
      WorkerProfile: {
        select: {
          userId: true,
          profilePic: true,
          userName: true,
        },
      },
      ClientProfile: {
        select: {
          userId: true,
          profilePic: true,
          userName: true,
        },
      },
      AdminProfile: {
        select: {
          userId: true,
          profilePic: true,
          User: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const invoice = await this.mainService.createInvoice({
    serviceRequestId: id,
    clientId: clientProfileId,
    workerId: serviceRequest.workerProfileId || '',
  });

  const workerUserId = serviceRequest.WorkerProfile?.userId;
  const clientUserId = serviceRequest.ClientProfile?.userId;

  if (!workerUserId) {
    throw new BadRequestException('Worker user ID is missing');
  }

  if (!clientUserId) {
    throw new BadRequestException('Client user ID is missing');
  }

  const notificationPayload = {
    type: 'SERVICE_CONFIRMED',
    serviceRequestId: id,
    serviceRequestName: serviceRequest.name,
    clientProfile: serviceRequest.ClientProfile?.profilePic,
    clientName: serviceRequest.ClientProfile?.userName,
    message: 'Your service request has been confirmed by the client.',
  };

  try {
    // ✅ Send WebSocket notification
    await this.notificationGateway.notifyUser(workerUserId, notificationPayload);

    // ✅ Save persistent notification
    await this.saveNotification({
      userId: workerUserId,
      title: 'Service Confirmed',
      body: 'Your service request has been confirmed by the client.',
      data: notificationPayload,
    });
  } catch (error) {
    this.logger.error('Failed to notify worker about confirmation', error);
  }

  return {
    data: {
      serviceRequest,
      invoice,
    },
    message: 'Service request confirmed successfully',
    success: true,
  };
}

  private async saveNotification({
  userId,
  title,
  body,
  data,
}: {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}) {
  try {
    await this.db.notification.create({
      data: {
        userId,
        title,
        body,
        data,
      },
    });
  } catch (error) {
    this.logger.error(`Failed to save notification for user ${userId}`, error);
  }
}

  
}
