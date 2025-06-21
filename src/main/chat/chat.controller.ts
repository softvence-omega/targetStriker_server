import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateDirectMessageDto } from './dto/createMessage.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateMessageService } from './services/create-message.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/utils/lib/multer.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private readonly createMessageService: CreateMessageService) {}

  @Post('create-message')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new MulterService().createMulterOptions('./temp', 'temp', FileType.ANY),
    ),
  )
  createMessage(
    @Body() data: CreateDirectMessageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.createMessageService.createMessage({
      content: data.content,
      conversationId: data.conversationId,
      file,
    });
  }
}
