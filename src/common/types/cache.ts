export const WEBSOCKET_CACHE_KEYS = {
  CLIENT_MAP: 'client_user_mapping',
  USER_WATCHERS: (userId: string) => `user_watchers:${userId}`,
  USER_WATCHERS_PREFIX: 'user_watchers:',
} as const;

export interface UserConnectionInfo {
  userId: string;
  clientIds: string[];
  connectionCount: number;
  watcherCount: number;
  isOnline: boolean;
}

export interface WatcherInfo {
  watcherId: string;
  watchedUserId: string;
  watcherUserId?: string;
}