import { forwardRef, Inject, Logger, UseFilters,  } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';import { IncomingMessage } from 'http';
import { WebSocketExceptionsFilter } from 'src/error/wsError.filter';
import { Server, WebSocket } from 'ws';

@UseFilters(WebSocketExceptionsFilter)
@WebSocketGateway({
  path: '/chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly clients: Map<string, Set<WebSocket>> = new Map();

  constructor(
    private readonly jwt: JwtService,
    private readonly configService: ConfigService
  ) {}

  afterInit(server: any) {
    this.logger.log('Chat gateway initialized');
  }

  handleConnection(client: WebSocket, ...args: any[]): void{
     const req = args[0] as IncomingMessage;
        const authHeader = req.headers['authorization'];
    
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          this.logger.warn('Missing or invalid Authorization header');
          client.close();
          return;
        }
    
        const token = authHeader.split(' ')[1];
    
        try {
          const decoded = this.jwt.verify(token, {
            secret: this.configService.getOrThrow('JWT_SECRET'),
          });
          (client as any).user = decoded;
    
          this.subscribeClient(decoded.profileId, client);
    
          this.logger.log(`Client connected: ${decoded.profileId || 'unknown user'}`);
    
          client.on('close', () => {
            this.handleDisconnect(client);
          });
        } catch (err) {
          this.logger.warn('JWT verification failed');
          client.close();
        }
  }

  handleDisconnect(client: WebSocket) {
    const user = (client as any).user;

    if (user && user.sub) {
      this.unsubscribeClient(user.profileId, client);
      this.logger.debug(`Client disconnected: ${user.profileId}`);
    } else {
      this.logger.debug('Client disconnected: unknown user');
    }
  }

    private subscribeClient(clientId: string, client: WebSocket): void {
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, new Set());
    }
    this.clients.get(clientId)!.add(client);
    this.logger.log(`Client subscribed to ${clientId}`);
  }

  private unsubscribeClient(clientId: string, client: WebSocket): void {
    const clients = this.clients.get(clientId);
    if (clients?.has(client)) {
      clients.delete(client);
      this.logger.log(`Client unsubscribed from ${clientId}`);

      // Clean up empty sets to prevent memory leaks
      if (clients.size === 0) {
        this.clients.delete(clientId);
        this.logger.debug(`Removed empty client set for ${clientId}`);
      }
    }
  }

  broadcastToConversation<T>({
    conversationId,
    type,
    payload,
  }: {
    conversationId: string;
    type: 'create' | 'update' | 'delete';
    payload: T;
  }): void {
    const clients = this.clients.get(conversationId);
    if (!clients || clients.size === 0) return;

    const message = JSON.stringify({ type, payload });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    this.logger.log(
      `Broadcasted ${type} event to ${clients.size} clients in conversation ${conversationId}`,
    );
  }
}
