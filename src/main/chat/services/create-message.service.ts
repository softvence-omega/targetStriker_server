import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { CreateDirectMessageDto } from '../dto/createMessage.dto';
import { FileService } from 'src/utils/file/file.service';
import { FileInstance } from 'generated/prisma';
import { ApiResponse } from 'src/common/types/apiResponse';
import { ChatGateway } from '../ws/chat.gateway';
import { ChatListGateway } from '../ws/chat-list.gateway';

@Injectable()
export class CreateMessageService {
  constructor(
    private readonly db: DbService,
    private readonly file: FileService,
    private readonly ChatGateway: ChatGateway,
    private readonly chatListGateway: ChatListGateway,
  ) {}

  public async createMessage(
    data: CreateDirectMessageDto,
    userId: string,
  ): Promise<ApiResponse<any>> {
    const { file, content, conversationId } = data;

    let fileInstance: FileInstance | null = null;
    if (file) fileInstance = await this.file.processUploadedFile(file);

    const message = await this.db.message.create({
      data: {
        content,
        Conversation: {
          connect: {
            id: conversationId,
          },
        },
        ...(fileInstance && { file: { connect: { id: fileInstance.id } } }),
        User:{
          connect: {
            id: userId,
          },
        }
      },
      include:{
        file:{
          select:{
            url: true,
            fileType: true,
          }
        },
        Conversation:{
          select:{
            memberOne:{
              select:{
                id: true,
              }
            },
            memberTwo:{
              select:{
                id: true,
              }
            }
          }
        }
      }
    });

    await this.db.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            lasMessage: {
              connect: {
                id: message.id,
              },
            },
          },
          include:{
            memberOne:{
              select:{
                id: true,
              }
            },
            memberTwo:{
              select:{
                id: true,
              }
            }
          }
        });


    await this.ChatGateway.broadcastToConversation({
      conversationId,
      type: 'create',
      payload: message,
    });

    if (message.Conversation) {
     await this.chatListGateway.broadcastChatListUpdate(message.Conversation.memberOne.id);
     await this.chatListGateway.broadcastChatListUpdate(message.Conversation.memberTwo.id);
    }

    return {
      data: message,
      message: 'Message created successfully',
      success: true,
    };
  }
}
