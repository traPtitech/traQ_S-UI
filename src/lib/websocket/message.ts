import { MessageId, UserId, StampId } from '@/types/entity-ids'

export interface MessageCreatedEvent {
  type: 'MESSAGE_CREATED'
  body: {
    id: MessageId
  }
}
export const onMessageCreated = (data: MessageCreatedEvent['body']) => {}

export interface MessageUpdatedEvent {
  type: 'MESSAGE_UPDATED'
  body: {
    id: MessageId
  }
}
export const onMessageUpdated = (data: MessageUpdatedEvent['body']) => {}

export interface MessageDeletedEvent {
  type: 'MESSAGE_DELETED'
  body: {
    id: MessageId
  }
}
export const onMessageDeleted = (data: MessageDeletedEvent['body']) => {}

export interface MessageReadEvent {
  type: 'MESSAGE_READ'
  body: {
    id: MessageId
  }
}
export const onMessageRead = (data: MessageReadEvent['body']) => {}

export interface MessageStampedEvent {
  type: 'MESSAGE_STAMPED'
  body: {
    message_id: MessageId
    user_id: UserId
    stamp_id: StampId
    count: number
    created_at: string
  }
}
export const onMessageStamped = (data: MessageStampedEvent['body']) => {}

export interface MessageUnstampedEvent {
  type: 'MESSAGE_UNSTAMPED'
  body: {
    message_id: MessageId
    user_id: UserId
    stamp_id: StampId
  }
}
export const onMessageUnstamped = (data: MessageUnstampedEvent['body']) => {}

export interface MessagePinnedEvent {
  type: 'MESSAGE_PINNED'
  body: {
    id: MessageId
  }
}
export const onMessagePinned = (data: MessagePinnedEvent['body']) => {}

export interface MessageUnpinnedEvent {
  type: 'MESSAGE_UNPINNED'
  body: {
    id: MessageId
  }
}
export const onMessageUnpinned = (data: MessageUnpinnedEvent['body']) => {}
