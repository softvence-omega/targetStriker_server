import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { CreateDirectMessageDto } from '../dto/createMessage.dto';
import { FileService } from 'src/utils/file/file.service';
import { FileInstance } from 'generated/prisma';
import { ApiResponse } from 'src/common/types/apiResponse';

@Injectable()
export class CreateMessageService {
  constructor(
    private readonly db: DbService,
    private readonly file: FileService,
  ) {}

  public async createMessage(data: CreateDirectMessageDto):Promise<ApiResponse<any>> {
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
    return {
      data: message,
      message: 'Message created successfully',
      success: true
    };
  }
}
