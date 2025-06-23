import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { CommonService } from './services/common.service';
import { CreateMessageService } from './services/create-message.service';
import { ChatGateway } from './chat.gateway';

@Module({
  controllers: [ChatController],
  providers: [CommonService, CreateMessageService, ChatGateway]
})
export class ChatModule {}
