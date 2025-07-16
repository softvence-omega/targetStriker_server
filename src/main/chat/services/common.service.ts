import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { EVENT_TYPES } from 'src/interfaces/event';
import { DbService } from 'src/utils/db/db.service';
import { EventService } from 'src/utils/event/event.service';
import { GetMessageDto } from '../dto/getMessage.sto';

@Injectable()
export class CommonService {
  constructor(
    private readonly db: DbService,
    private readonly event: EventService,
  ) {}

  public async findConversation(memberOneId: string, memberTwoId: string) {
    return await this.db.conversation.findFirst({
      where: {
        AND: [{ memberOneId: memberOneId }, { memberTwoId: memberTwoId }],
      },
      include: {
        memberOne: {
          select: {
            id: true,
          },
        },
        memberTwo: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  public async createConversation(memberOneId: string, memberTwoId: string) {
    return await this.db.conversation.create({
      data: {
        memberTwoId,
        memberOneId,
      },
    });
  }

  @OnEvent(EVENT_TYPES.CONVERSATION_CREATE)
  async getOrCreteConversationEventHandler({
    memberOneId,
    memberTwoId,
  }: {
    memberOneId: string;
    memberTwoId: string;
  }) {
    const conversation = await this.findConversation(memberOneId, memberTwoId);

    if (conversation) {
      return conversation;
    }

    return await this.createConversation(memberOneId, memberTwoId);
  }

  public async getMessages(
  { conversationId, cursor, take }: GetMessageDto,
  userId: string
): Promise<ApiResponse<any>> {
  const messages = await this.db.message.findMany({
    where: { conversationId },
    ...(cursor && { cursor: { id: cursor } }),
    skip: cursor ? 1 : 0,
    ...(take && { take }),
    orderBy: { createdAt: 'desc' },
    include: {
      file: {
        select: {
          url: true,
          fileType: true,
        },
      },
      User: {
        select: {
          id: true,
          name: true,
          UserType: true,
          clientProfile: {
            select: {
              userName: true,
              profilePic: { select: { url: true } },
            },
          },
          workerProfile: {
            select: {
              userName: true,
              profilePic: { select: { url: true } },
            },
          },
          adminProfile: {
            select: {
              profilePic: { select: { url: true } },
            },
          },
        },
      },
    },
  });

  const transformedMessages = messages.map((message) => {
    const profileInfo = this.getProfileInfo(message.User);
    const { User, ...rest } = message;

    return {
      ...rest,
      name: profileInfo.name,
      senderProfilePic: profileInfo.profilePicUrl,
      isSender: message.userId === userId,
    };
  });

  return {
    data: transformedMessages.reverse(), // recent message last
    message: 'Messages fetched successfully',
    success: true,
  };
}


  private getProfileInfo(user: any) {
  if (!user) return { name: null, profilePicUrl: null };

  const { UserType, clientProfile, workerProfile, adminProfile, name } = user;

  if (UserType === 'CLIENT' && clientProfile) {
    return {
      name: clientProfile.userName || name,
      profilePicUrl: clientProfile.profilePic?.url || null,
    };
  }

  if (UserType === 'WORKER' && workerProfile) {
    return {
      name: workerProfile.userName || name,
      profilePicUrl: workerProfile.profilePic?.url || null,
    };
  }

  if (UserType === 'ADMIN' && adminProfile) {
    return {
      name: name,
      profilePicUrl: adminProfile.profilePic?.url || null,
    };
  }

  return {
    name: name,
    profilePicUrl: null,
  };
}

  public findConversationById(id: string) {
    return this.db.conversation.findUnique({
      where: {
        id,
      },
      include: {
        memberOne: {
          select: {
            id: true,
          },
        },
        memberTwo: {
          select: {
            id: true,
          },
        },
      },
    });
  }
}