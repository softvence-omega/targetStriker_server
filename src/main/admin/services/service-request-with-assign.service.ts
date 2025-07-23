import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { CreateServiceRequestWithAssignDTO } from '../dto/createServiceWithAssign.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { FileService } from 'src/utils/file/file.service';
import { CommonService } from './common.service';
import { NotificationGateway } from 'src/main/notification/notification.gateway';
import { ChatListGateway } from 'src/main/chat/ws/chat-list.gateway';

@Injectable()
export class ServiceRequestWithAssignService {
    constructor(  private readonly db: DbService,
  private readonly file: FileService,
  private readonly commonService: CommonService,
  private readonly notificationGateway: NotificationGateway,
  private readonly chatListService: ChatListGateway,
    ) {}

   async createServiceWithAssign(rawData: CreateServiceRequestWithAssignDTO, { id }: IdDto): Promise<ApiResponse<any>> {
  const { reqPhoto, name, taskTypeId, workerId, ...rest } = rawData;

  if (!reqPhoto) {
    throw new BadRequestException('reqPhoto is required');
  }

  const file = await this.file.processUploadedFile(reqPhoto);

  const [client, admin, workerCreator] = await Promise.all([
    this.db.clientProfile.findUnique({ where: { id } }),
    this.db.adminProfile.findUnique({ where: { id } }),
    this.db.workerProfile.findUnique({ where: { id } }),
  ]);

  if (!client && !admin && !workerCreator) {
    this.file.remove(file.id);
    throw new BadRequestException('Invalid profile ID');
  }

  const data: any = {
    reqPhoto: { connect: { id: file.id } },
    name,
    ...rest,
    TaskType: { connect: { id: taskTypeId } },
    WorkerProfile: { connect: { id: workerId } },
    status: 'ASSIGNED',
  };

  if (client) data.ClientProfile = { connect: { id } };
  else if (admin) data.AdminProfile = { connect: { id } };
  else if (workerCreator) data.WorkerProfile = { connect: { id } };

  try {
    const serviceRequest = await this.db.serviceRequest.create({
      data,
      include: {
        reqPhoto: { select: { url: true } },
        tasks: { select: { name: true, price: true } },
        ClientProfile: true,
        AdminProfile: { include: { User: { select: { name: true } } } },
        WorkerProfile: { select: { id: true, userId: true, userName: true, profilePic: true } },
      },
    });

    const creator = client
      ? { role: 'CLIENT', profile: serviceRequest.ClientProfile }
      : admin
      ? { role: 'ADMIN', profile: serviceRequest.AdminProfile }
      : { role: 'WORKER', profile: workerCreator };

    // 🧠 Get userId of creator
    const creatorUserId =
      serviceRequest.ClientProfile?.userId ??
      serviceRequest.AdminProfile?.userId ??
      workerCreator?.userId;

    const workerUserId = serviceRequest.WorkerProfile?.userId;

    if (!workerUserId || !creatorUserId) {
      throw new BadRequestException('Missing userId for worker or creator');
    }

    // ✅ Create conversation between creator and worker
    const existingConversation = await this.db.conversation.findFirst({
      where: {
        OR: [
          { memberOneId: creatorUserId, memberTwoId: workerUserId },
          { memberOneId: workerUserId, memberTwoId: creatorUserId },
        ],
      },
    });

    if (!existingConversation) {
      await this.db.conversation.create({
        data: {
          memberOne: { connect: { id: creatorUserId } },
          memberTwo: { connect: { id: workerUserId } },
        },
      });
    }

    // ✅ Add conversation with Admin
    const adminUser = await this.db.user.findFirst({
      where: { UserType: 'ADMIN' },
      select: { id: true },
    });

    if (adminUser) {
      const participants = [creatorUserId, workerUserId];
      for (const participantId of participants) {
        const adminConvo = await this.db.conversation.findFirst({
          where: {
            OR: [
              { memberOneId: participantId, memberTwoId: adminUser.id },
              { memberOneId: adminUser.id, memberTwoId: participantId },
            ],
          },
        });
        if (!adminConvo) {
          await this.db.conversation.create({
            data: {
              memberOne: { connect: { id: participantId } },
              memberTwo: { connect: { id: adminUser.id } },
            },
          });
        }
      }

      // 🔄 Broadcast chat updates
      await this.chatListService.broadcastChatListUpdate(creatorUserId);
      await this.chatListService.broadcastChatListUpdate(workerUserId);
      await this.chatListService.broadcastChatListUpdate(adminUser.id);
    }

    // ✅ Send notifications to creator
    await this.notificationGateway.notifyUser(creatorUserId, {
      type: 'TASK_ASSIGNED',
      payload: {
        taskId: serviceRequest.id,
        tastName: serviceRequest.name,
        role: creator.role,
        message: 'A worker has been assigned to your request.',
        workerName: serviceRequest.WorkerProfile?.userName,
        workerProfile: serviceRequest.WorkerProfile?.profilePic,
      },
    });

    // ✅ Send notifications to worker
    await this.notificationGateway.notifyUser(workerUserId, {
      type: 'TASK_ASSIGNED',
      payload: {
        taskId: serviceRequest.id,
        tastName: serviceRequest.name,
        role: 'WORKER',
        message: 'You have been assigned a new service request.',
        clientName: creator.role === 'CLIENT'
          ? serviceRequest.ClientProfile?.userName
          : serviceRequest.AdminProfile?.User?.name,
        // clientProfile: creator.profile?.profilePic,
      },
    });

    return {
      data: {
        ...serviceRequest,
        createdBy: creator,
      },
      message: 'Service request created and assigned successfully',
      success: true,
    };
  } catch (error) {
    this.file.remove(file.id);
    throw new BadRequestException(`Failed to create service request\n${error}`);
  }
}

}
