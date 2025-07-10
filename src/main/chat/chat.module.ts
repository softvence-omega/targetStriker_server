import { Global, Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { CommonService } from './services/common.service';
import { CreateMessageService } from './services/create-message.service';
import { ChatGateway } from './ws/chat.gateway';
import { ChatListGateway } from './ws/chat-list.gateway';
import { ChatListService } from './services/chat-list.service';

@Global()
@Module({
  controllers: [ChatController],
  providers: [CommonService, CreateMessageService, ChatGateway, ChatListGateway, ChatListService],
  exports:[ChatGateway, ChatListGateway]
})
export class ChatModule {}
