import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { CreateDirectMessageDto } from '../dto/createMessage.dto';
import { FileService } from 'src/utils/file/file.service';
import { FileInstance } from 'generated/prisma';
import { ApiResponse } from 'src/common/types/apiResponse';
import { ChatGateway } from '../chat.gateway';

@Injectable()
export class CreateMessageService {
  constructor(
    private readonly db: DbService,
    private readonly file: FileService,
    private readonly ChatGateway: ChatGateway,
  ) {}

  public async createMessage(
    data: CreateDirectMessageDto,
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
      },
    });

    await this.ChatGateway.broadcastToConversation({
      conversationId,
      type: 'create',
      payload: message,
    });

    return {
      data: message,
      message: 'Message created successfully',
      success: true,
    };
  }
}
