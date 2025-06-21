import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { CommonService } from './services/common.service';
import { CreateMessageService } from './services/create-message.service';

@Module({
  controllers: [ChatController],
  providers: [CommonService, CreateMessageService]
})
export class ChatModule {}
