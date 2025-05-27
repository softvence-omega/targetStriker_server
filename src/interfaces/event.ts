import { NotificationEvent } from "./notification";

export const EVENT_TYPES = {
  NOTIFICATION_SEND: 'NOTIFICATION_SEND',
  BULK_NOTIFICATION_SEND: 'BULK_NOTIFICATION_SEND',
} as const;


export interface EventPayloadMap {
  [EVENT_TYPES.NOTIFICATION_SEND]: Partial<NotificationEvent>;
  [EVENT_TYPES.BULK_NOTIFICATION_SEND]: Partial<NotificationEvent>[];
}

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];
