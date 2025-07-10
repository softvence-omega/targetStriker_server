import {
  Body,
  Controller,
  Get,
  Injectable,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateDirectMessageDto } from './dto/createMessage.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateMessageService } from './services/create-message.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/utils/lib/multer.service';
import { IdDto } from 'src/common/dto/id.dto';
import { CommonService } from './services/common.service';
import { GetMessageDto } from './dto/getMessage.sto';
import { AuthenticatedRequest } from 'src/common/types/AuthenticatedRequest';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(
    private readonly createMessageService: CreateMessageService,
    private readonly commonService: CommonService,
  ) {}

  @Post('create-message')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new MulterService().createMulterOptions('./temp', 'temp', FileType.ANY),
    ),
  )
  createMessage(
    @Body() data: CreateDirectMessageDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest
  ) {
    return this.createMessageService.createMessage({
      content: data.content,
      conversationId: data.conversationId,
      file,
    }, req.user.sub);
  }

  @Get('messages')
  getMessages(
    @Query() rawData: GetMessageDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.commonService.getMessages(
      rawData, req.user.sub
    );
  }
}
