import { Injectable, Logger, UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocketExceptionsFilter } from 'src/error/wsError.filter';
import { CacheService } from 'src/utils/cache/cache.service';
import { DbService } from 'src/utils/db/db.service';
import { Server, WebSocket } from 'ws';

@UseFilters(WebSocketExceptionsFilter)
@WebSocketGateway({
  path: '/ts/weak_up',
  cors: { origin: '*' },
})
@Injectable()
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AuthGateway.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly db: DbService,
  ) {}

  async handleConnection(client: WebSocket, ...args: any[]) {
  const req = args[0] as IncomingMessage;
  
  const authHeader = req.headers['authorization'];
  
  // Multiple ways to get FCM token
  const fcmToken = req.headers['fcm_token'] as string 
  // Extract from URL query parameters (primary method for web clients)
  const urlParams = new URLSearchParams(req.url?.split('?')[1] || '');
  const fcmTokenFromUrl = urlParams.get('fcm_token');
  
  if (!fcmToken && !fcmTokenFromUrl) {
    this.logger.warn('No FCM token provided in headers or URL');
    client.send(JSON.stringify({
      type: 'error',
      message: 'No FCM token provided',
    }));
    return;
    
  }

  const finalFcmToken = fcmToken || fcmTokenFromUrl;

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

    const userId = decoded.sub;
    const clientId = this.generateClientId();
    (client as any).userId = userId;
    (client as any).clientId = clientId;
    (client as any).fcmTokenReceived = !!finalFcmToken;

    // Use the dedicated cache service
    await this.cacheService.storeClientUserMapping(clientId, userId);

    await this.db.user.update({
      where: { id: userId },
      data: { active: true },
    });

    // Save FCM token if available from URL/headers
    if (finalFcmToken) {
      await this.saveFcmToken(userId, finalFcmToken);
      this.logger.log(`FCM token saved for user ${userId} from ${fcmToken ? 'headers' : 'URL'}`);
    } else {
      this.logger.log(`User ${userId} connected without FCM token - expecting it via message`);
    }

    await this.broadcastUserStatus(userId, true);

    this.logger.log(`User ${userId} connected with client ${clientId}`);

    client.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        
        if (data.type === 'fcm_token' && data.token) {
          this.handleFcmToken(userId, data.token);
          (client as any).fcmTokenReceived = true;
        } else if (data.type === 'watch_user_status' && data.userId) {
          this.handleWatchUserStatus(clientId, data.userId);
        }
      } catch (err) {
        this.logger.warn('Invalid JSON received from client');
      }
    });
  } catch (error) {
    console.log(error);
    this.logger.warn('JWT verification failed');
    client.close();
  }
}

private async handleFcmToken(userId: string, fcmToken: string) {
  try {
    await this.saveFcmToken(userId, fcmToken);
    this.logger.log(`FCM token received and saved for user ${userId}`);
  } catch (error) {
    this.logger.error(`Failed to save FCM token for user ${userId}:`, error);
  }
}

  async handleDisconnect(client: WebSocket) {
    const userId = (client as any).userId;
    const clientId = (client as any).clientId;

    if (!userId || !clientId) return;

    // Update user status in database
    await this.db.user.update({
      where: { id: userId },
      data: { active: false },
    });

    // Broadcast status change
    await this.broadcastUserStatus(userId, false);

    // Clean up cache using the dedicated service
    await this.cacheService.cleanupWatchersForClient(clientId);
    await this.cacheService.removeClientUserMapping(clientId);

    this.logger.log(
      `User ${userId} disconnected, client ${clientId} cleaned up`,
    );
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async handleWatchUserStatus(clientId: string, userId: string) {
    await this.cacheService.addUserWatcher(userId, clientId);
    this.logger.log(`Client ${clientId} is now watching user ${userId}`);
  }

  private async broadcastUserStatus(userId: string, isActive: boolean) {
    const watcherIds = await this.cacheService.getUserWatchers(userId);

    if (watcherIds.length === 0) {
      this.logger.debug(`No watchers for user ${userId}`);
      return;
    }

    const message = JSON.stringify({
      type: 'user_status',
      payload: { userId, active: isActive },
    });

    const connectedClients = this.getConnectedClients();
    const activeWatchers: string[] = [];
    let sentCount = 0;

    for (const watcherId of watcherIds) {
      const client = connectedClients.find(
        (c) => (c as any).clientId === watcherId,
      );

      if (client && client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
          activeWatchers.push(watcherId);
          sentCount++;
        } catch (error) {
          this.logger.warn(
            `Failed to send message to client ${watcherId}:`,
            error,
          );
        }
      }
    }

    // Update cache with only active watchers if there were disconnected ones
    if (activeWatchers.length !== watcherIds.length) {
      for (const inactiveWatcher of watcherIds) {
        if (!activeWatchers.includes(inactiveWatcher)) {
          await this.cacheService.removeUserWatcher(userId, inactiveWatcher);
        }
      }
    }

    this.logger.debug(
      `Broadcasted status for user ${userId} to ${sentCount} watchers`,
    );
  }

  private getConnectedClients(): WebSocket[] {
    return Array.from(this.server.clients);
  }

  // ==================== PUBLIC METHODS FOR OTHER SERVICES ====================

  /**
   * Broadcast a custom message to all watchers of a user
   */
  async broadcastToUserWatchers(userId: string, message: any) {
    const watcherIds = await this.cacheService.getUserWatchers(userId);
    const connectedClients = this.getConnectedClients();

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const watcherId of watcherIds) {
      const client = connectedClients.find(
        (c) => (c as any).clientId === watcherId,
      );

      if (client && client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
          sentCount++;
        } catch (error) {
          this.logger.warn(
            `Failed to send custom message to client ${watcherId}:`,
            error,
          );
        }
      }
    }

    this.logger.debug(
      `Sent custom message to ${sentCount} watchers of user ${userId}`,
    );
    return sentCount;
  }

  /**
   * Broadcast message to all connections of a specific user
   */
  async broadcastToUser(userId: string, message: any) {
    const clientIds = await this.cacheService.getClientIdsByUserId(userId);
    const connectedClients = this.getConnectedClients();

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const clientId of clientIds) {
      const client = connectedClients.find(
        (c) => (c as any).clientId === clientId,
      );

      if (client && client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
          sentCount++;
        } catch (error) {
          this.logger.warn(
            `Failed to send message to user ${userId}, client ${clientId}:`,
            error,
          );
        }
      }
    }

    this.logger.debug(
      `Sent message to user ${userId} on ${sentCount} connections`,
    );
    return sentCount;
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats() {
    return await this.cacheService.getCacheStatistics();
  }

  /**
   * Save or update a user's FCM token
   */
  public async saveFcmToken(userId: string, fcmToken: string) {
    try {
      const isExist = await this.db.fcm_token.findUnique({
        where: {
          userId: userId,
        },
      });

      if (isExist) {
        await this.db.fcm_token.update({
          where: {
            userId: userId,
          },
          data: {
            token: fcmToken,
          },
        });
      } else {
        await this.db.fcm_token.create({
          data: {
            userId: userId,
            token: fcmToken,
          },
        });
      }
    } catch (error) {
      throw new WsException(error);
    }
  }
}
