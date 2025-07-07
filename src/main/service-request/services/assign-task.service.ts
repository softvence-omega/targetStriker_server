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

@Injectable()
export class AssignTaskService {
  private readonly logger = new Logger(AssignTaskService.name);
  constructor(
    private readonly db: DbService,
    private readonly commonService: CommonService,
    private readonly mainService: MainService,
    private readonly chatListService: ChatListGateway,
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

  public async assignTask({
    taskId,
    workerId,
  }: AssignTaskDto): Promise<ApiResponse<any>> {
    const isExist = await this.commonService.findServiceRequest({ id: taskId });

    if (!isExist) {
      throw new BadRequestException('Service request not found');
    }

    const data = await this.db.serviceRequest.update({
      where: {
        id: taskId,
      },
      data: {
        WorkerProfile: {
          connect: {
            id: workerId,
          },
        },
        status: 'ASSIGNED',
      },
      include: {
        WorkerProfile: {
          select:{
            userId  : true,
          }
        },
        ClientProfile: {
          select:{
            userId: true,
          }
        },
      },
    });

    console.log(data);
    if (!data.WorkerProfile?.userId) {
      throw new BadRequestException('Worker profile ID is missing');
    }

    if (!data.ClientProfile?.userId) {
      throw new BadRequestException('Client profile ID is missing');
    }

    try {
      const existingConversation = await this.db.conversation.findFirst({
        where: {
          OR: [
        {
          memberOneId: data.ClientProfile?.userId,
          memberTwoId: data.WorkerProfile?.userId,
        },
        {
          memberOneId: data.WorkerProfile?.userId,
          memberTwoId: data.ClientProfile?.userId,
        },
          ],
        },
      });

      if (!existingConversation) {
        await this.db.conversation.create({
          data: {
        memberOne: {
          connect: {
            id: data.ClientProfile?.userId,
          },
        },
        memberTwo: {
          connect: {
            id: data.WorkerProfile?.userId,
          },
        },
          },
        });
      }

      // Create conversation with admin
      const admin = await this.db.user.findFirst({
        where: { UserType: 'ADMIN' },
        select: { id: true },
      });

      if (admin) {
        // Client <-> Admin
        const clientAdminConversation = await this.db.conversation.findFirst({
          where: {
        OR: [
          {
            memberOneId: data.ClientProfile?.userId,
            memberTwoId: admin.id,
          },
          {
            memberOneId: admin.id,
            memberTwoId: data.ClientProfile?.userId,
          },
        ],
          },
        });

        if (!clientAdminConversation) {
          await this.db.conversation.create({
        data: {
          memberOne: {
            connect: { id: data.ClientProfile?.userId },
          },
          memberTwo: {
            connect: { id: admin.id },
          },
        },
          });
        }

        // Worker <-> Admin
        const workerAdminConversation = await this.db.conversation.findFirst({
          where: {
        OR: [
          {
            memberOneId: data.WorkerProfile?.userId,
            memberTwoId: admin.id,
          },
          {
            memberOneId: admin.id,
            memberTwoId: data.WorkerProfile?.userId,
          },
        ],
          },
        });

        if (!workerAdminConversation) {
          await this.db.conversation.create({
        data: {
          memberOne: {
            connect: { id: data.WorkerProfile?.userId },
          },
          memberTwo: {
            connect: { id: admin.id },
          },
        },
          });
        }
      }
      await this.chatListService.broadcastChatListUpdate(data.ClientProfile?.userId);
      await this.chatListService.broadcastChatListUpdate(data.WorkerProfile?.userId);
      admin && await this.chatListService.broadcastChatListUpdate(admin.id);
    } catch (error) {
      this.logger.error('Error creating conversation:', error);
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
    });
    const invoice = await this.mainService.createInvoice({
      serviceRequestId: id,
      clientId: clientProfileId,
      workerId: serviceRequest.workerProfileId || '',
    });

    return {
      data: {
        serviceRequest,
        invoice,  
      },
      message: 'Service request confirmed successfully',
      success: true,
    };
  }
}
