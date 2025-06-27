import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
import { IdDto } from 'src/common/dto/id.dto';
import { CommonService } from './services/common.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(
    private readonly createMessageService: CreateMessageService,
    private readonly commonService: CommonService
  ) {}

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

  @Get('messages/:id')
  getMessages(
    @Param() { id: conversationId }: IdDto,
    @Query() { id: cursor }: IdDto,
  ) {
    return this.commonService.getMessages({ id: conversationId }, { id: cursor });
  }
}
