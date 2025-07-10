import { Logger, UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocketExceptionsFilter } from 'src/error/wsError.filter';
import { Server, WebSocket } from 'ws';
import { ChatListService } from '../services/chat-list.service';

@UseFilters(new WebSocketExceptionsFilter())
@WebSocketGateway({
  path: '/ts/chat-list',
  cors: {
    origin: '*',
  },
})
export class ChatListGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatListGateway.name);
  private readonly clients: Map<string, Set<WebSocket>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatListService: ChatListService, 
  ) {}

   afterInit(): void {
    this.logger.log('Chat List WebSocket Gateway Initialized');
  }

  handleConnection(client: WebSocket, ...args: any[]): void {
    const req = args[0] as IncomingMessage;
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Missing or invalid Authorization header');
      client.close();
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });

      const userId = decoded.sub as string;

      if (!userId) {
        throw new WsException('Invalid token payload: missing user ID');
      }

      (client as any).userId = userId;

      this.subscribeClient(userId, client);

      client.on('close', () => {
        this.handleDisconnect(client);
      });

      this.logger.log(`Client connected: ${userId}`);
    } catch (err) {
      this.logger.warn('JWT verification failed');
      client.close();
    }
  }

    private subscribeClient(userId: string, client: WebSocket): void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(client);
    this.logger.log(`Client subscribed for user ${userId}`);
  }

    handleDisconnect(client: WebSocket): void {
    this.removeClientFromAllUsers(client);
    this.logger.log('Client disconnected from Chat List Gateway');
  }

   private removeClientFromAllUsers(client: WebSocket): void {
    for (const [userId, clients] of this.clients.entries()) {
      if (clients.has(client)) {
        clients.delete(client);
        this.logger.log(`Client removed from user ${userId} after disconnect`);
      }
    }
  }

  @SubscribeMessage('get_chat_list')
  async handleGetChatList(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() payload: { take?: number; cursor?: string },
  ): Promise<void> {
    const userId = (client as any).userId;
    if (!userId) throw new WsException('User ID not found in client');

    const chatList = await this.chatListService.getChatsList(userId);
    

    client.send(
      JSON.stringify({
        type: 'chat_list',
        payload: chatList,
      }),
    );
  }

   async broadcastChatListUpdate(userId: string): Promise<void> {
    const clients = this.clients.get(userId);
    if (!clients || clients.size === 0) return;

    const chatList = await this.chatListService.getChatsList(userId); // send latest 20 only

    const message = JSON.stringify({
      type: 'chat_list_update',
      payload: chatList,
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    this.logger.log(
      `Broadcasted chat list update to ${clients.size} clients for user ${userId}`,
    );
  }

}
