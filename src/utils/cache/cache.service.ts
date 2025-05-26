import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UserConnectionInfo, WatcherInfo, WEBSOCKET_CACHE_KEYS } from 'src/common/types/cache';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // ==================== CLIENT-USER MAPPINGS ====================

  /**
   * Store client-user mapping
   */
  async storeClientUserMapping(clientId: string, userId: string): Promise<void> {
    const mappings = await this.getClientUserMappings();
    mappings[clientId] = userId;
    await this.cacheManager.set(WEBSOCKET_CACHE_KEYS.CLIENT_MAP, mappings, 0);
    this.logger.debug(`Stored mapping: ${clientId} -> ${userId}`);
  }

  /**
   * Remove client-user mapping
   */
  async removeClientUserMapping(clientId: string): Promise<void> {
    const mappings = await this.getClientUserMappings();
    delete mappings[clientId];
    await this.cacheManager.set(WEBSOCKET_CACHE_KEYS.CLIENT_MAP, mappings, 0);
    this.logger.debug(`Removed mapping for client: ${clientId}`);
  }

  /**
   * Get all client-user mappings
   */
  async getClientUserMappings(): Promise<Record<string, string>> {
    return (
      (await this.cacheManager.get<Record<string, string>>(
        WEBSOCKET_CACHE_KEYS.CLIENT_MAP,
      )) || {}
    );
  }

  /**
   * Get user ID by client ID
   */
  async getUserIdByClientId(clientId: string): Promise<string | null> {
    const mappings = await this.getClientUserMappings();
    return mappings[clientId] || null;
  }

  /**
   * Get all client IDs for a specific user
   */
  async getClientIdsByUserId(userId: string): Promise<string[]> {
    const mappings = await this.getClientUserMappings();
    return Object.keys(mappings).filter(clientId => mappings[clientId] === userId);
  }

  // ==================== USER WATCHERS ====================

  /**
   * Add a watcher for a user
   */
  async addUserWatcher(userId: string, watcherClientId: string): Promise<void> {
    const cacheKey = WEBSOCKET_CACHE_KEYS.USER_WATCHERS(userId);
    const watchers = await this.getUserWatchers(userId);

    if (!watchers.includes(watcherClientId)) {
      watchers.push(watcherClientId);
      await this.cacheManager.set(cacheKey, watchers, 0);
      this.logger.debug(`Added watcher ${watcherClientId} for user ${userId}`);
    }
  }

  /**
   * Remove a watcher for a user
   */
  async removeUserWatcher(userId: string, watcherClientId: string): Promise<void> {
    const cacheKey = WEBSOCKET_CACHE_KEYS.USER_WATCHERS(userId);
    const watchers = await this.getUserWatchers(userId);
    const updatedWatchers = watchers.filter(id => id !== watcherClientId);

    if (updatedWatchers.length === 0) {
      await this.cacheManager.del(cacheKey);
    } else if (updatedWatchers.length !== watchers.length) {
      await this.cacheManager.set(cacheKey, updatedWatchers, 0);
    }

    this.logger.debug(`Removed watcher ${watcherClientId} for user ${userId}`);
  }

  /**
   * Get all watchers for a specific user
   */
  async getUserWatchers(userId: string): Promise<string[]> {
    const cacheKey = WEBSOCKET_CACHE_KEYS.USER_WATCHERS(userId);
    return (await this.cacheManager.get<string[]>(cacheKey)) || [];
  }

  /**
   * Check if a user is being watched
   */
  async isUserBeingWatched(userId: string): Promise<boolean> {
    const watchers = await this.getUserWatchers(userId);
    return watchers.length > 0;
  }

  /**
   * Clean up all watchers for a specific client
   */
  async cleanupWatchersForClient(clientId: string): Promise<void> {
    const mappings = await this.getClientUserMappings();

    // Find all users this client was watching
    for (const userId of Object.values(mappings)) {
      await this.removeUserWatcher(userId, clientId);
    }

    this.logger.debug(`Cleaned up all watchers for client: ${clientId}`);
  }

  // ==================== USER STATUS & ANALYTICS ====================

  /**
   * Check if a user is currently online (has active connections)
   */
  async isUserOnline(userId: string): Promise<boolean> {
    const clientIds = await this.getClientIdsByUserId(userId);
    return clientIds.length > 0;
  }

  /**
   * Get all currently online users
   */
  async getOnlineUsers(): Promise<string[]> {
    const mappings = await this.getClientUserMappings();
    return [...new Set(Object.values(mappings))];
  }

  /**
   * Get total count of online users
   */
  async getOnlineUsersCount(): Promise<number> {
    const onlineUsers = await this.getOnlineUsers();
    return onlineUsers.length;
  }

  /**
   * Get total count of active connections
   */
  async getActiveConnectionsCount(): Promise<number> {
    const mappings = await this.getClientUserMappings();
    return Object.keys(mappings).length;
  }

  /**
   * Get detailed connection info for a specific user
   */
  async getUserConnectionInfo(userId: string): Promise<UserConnectionInfo> {
    const clientIds = await this.getClientIdsByUserId(userId);
    const watchers = await this.getUserWatchers(userId);

    return {
      userId,
      clientIds,
      connectionCount: clientIds.length,
      watcherCount: watchers.length,
      isOnline: clientIds.length > 0,
    };
  }

  /**
   * Get connection info for all online users
   */
  async getAllUsersConnectionInfo(): Promise<UserConnectionInfo[]> {
    const onlineUsers = await this.getOnlineUsers();
    return Promise.all(
      onlineUsers.map(userId => this.getUserConnectionInfo(userId))
    );
  }

  /**
   * Get users who are watching a specific user (resolve client IDs to user IDs)
   */
  async getUsersWatchingUser(userId: string): Promise<string[]> {
    const watcherClientIds = await this.getUserWatchers(userId);
    const mappings = await this.getClientUserMappings();
    
    return watcherClientIds
      .map(clientId => mappings[clientId])
      .filter(Boolean);
  }

  /**
   * Get all watcher relationships
   */
  async getAllWatcherRelationships(): Promise<WatcherInfo[]> {
    const mappings = await this.getClientUserMappings();
    const relationships: WatcherInfo[] = [];

    // Get all watcher cache keys
    const cacheKeys = await this.getAllUserWatcherKeys();
    
    for (const key of cacheKeys) {
      const userId = key.replace(WEBSOCKET_CACHE_KEYS.USER_WATCHERS_PREFIX, '');
      const watcherClientIds = await this.getUserWatchers(userId);
      
      for (const watcherClientId of watcherClientIds) {
        relationships.push({
          watcherId: watcherClientId,
          watchedUserId: userId,
          watcherUserId: mappings[watcherClientId],
        });
      }
    }

    return relationships;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get all user watcher cache keys (implementation depends on your cache manager)
   */
  private async getAllUserWatcherKeys(): Promise<string[]> {
    // Note: This method implementation depends on your cache manager
    // For Redis, you might use SCAN or KEYS commands
    // For in-memory cache, you might need to track keys separately
    
    // This is a placeholder - implement based on your cache manager
    // For now, we'll return empty array as this is used for admin/analytics
    this.logger.warn('getAllUserWatcherKeys not implemented for current cache manager');
    return [];
  }

  /**
   * Clear all WebSocket-related cache data
   */
  async clearAllWebSocketCache(): Promise<void> {
    await this.cacheManager.del(WEBSOCKET_CACHE_KEYS.CLIENT_MAP);
    
    // Note: Clearing all user watcher keys requires knowing all keys
    // Implementation depends on your cache manager
    this.logger.warn('Partial cache clear - user watcher keys not cleared');
  }

  /**
   * Get cache statistics
   */
  async getCacheStatistics(): Promise<{
    totalConnections: number;
    uniqueUsers: number;
    totalWatcherRelationships: number;
  }> {
    const totalConnections = await this.getActiveConnectionsCount();
    const uniqueUsers = await this.getOnlineUsersCount();
    const watcherRelationships = await this.getAllWatcherRelationships();

    return {
      totalConnections,
      uniqueUsers,
      totalWatcherRelationships: watcherRelationships.length,
    };
  }

}
