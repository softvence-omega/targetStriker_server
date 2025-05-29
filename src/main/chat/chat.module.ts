import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { CommonService } from './services/common.service';

@Module({
  controllers: [ChatController],
  providers: [CommonService]
})
export class ChatModule {}
