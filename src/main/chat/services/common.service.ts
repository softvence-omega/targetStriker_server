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

  public async getMessages({
    conversationId,
    cursor,
    take
  }:GetMessageDto):Promise<ApiResponse<any>> {
    console.log(take);
    
    const data = await this.db.message.findMany({
      where: {
        conversationId,
      },
     ...(cursor && { cursor: { id: cursor } }),
      skip: cursor ? 1 : 0,
      ...(take && { take: take }),
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      data: data.reverse(),
      message: 'Messages fetched successfully',
      success: true,
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
