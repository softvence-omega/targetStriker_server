import { NotificationEvent } from './notification';

export const EVENT_TYPES = {
  NOTIFICATION_SEND: 'NOTIFICATION_SEND',
  BULK_NOTIFICATION_SEND: 'BULK_NOTIFICATION_SEND',
  CONVERSATION_CREATE: 'CONVERSATION_CREATE',
} as const;

export interface ConversationCreateEvent {
  memberOneId: string;
  memberTwoId: string;
}

export interface EventPayloadMap {
  [EVENT_TYPES.NOTIFICATION_SEND]: Partial<NotificationEvent>;
  [EVENT_TYPES.BULK_NOTIFICATION_SEND]: Partial<NotificationEvent>[];
  [EVENT_TYPES.CONVERSATION_CREATE]: ConversationCreateEvent;
}

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
