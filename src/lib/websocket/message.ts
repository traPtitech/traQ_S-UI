import { MessageId, UserId, StampId } from '@/types/entity-ids'
import apis from '@/lib/api'
import store from '@/store'

export interface MessageCreatedEvent {
  type: 'MESSAGE_CREATED'
  body: {
    id: MessageId
  }
}
export const onMessageCreated = async ({ id }: MessageCreatedEvent['body']) => {
  //const res = await apis.getMessage(id)
  //store.commit.entities.addMessage({ id, entity: res.data })
  console.error('onMessageCreated: Not implemented')
}

export interface MessageUpdatedEvent {
  type: 'MESSAGE_UPDATED'
  body: {
    id: MessageId
  }
}
export const onMessageUpdated = (data: MessageUpdatedEvent['body']) => {
  console.error('onMessageUpdated: Not implemented')
}

export interface MessageDeletedEvent {
  type: 'MESSAGE_DELETED'
  body: {
    id: MessageId
  }
}
export const onMessageDeleted = (data: MessageDeletedEvent['body']) => {
  console.error('onMessageDeleted: Not implemented')
}

export interface MessageReadEvent {
  type: 'MESSAGE_READ'
  body: {
    id: MessageId
  }
}
export const onMessageRead = (data: MessageReadEvent['body']) => {
  console.error('onMessageRead: Not implemented')
}

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
export const onMessageStamped = (data: MessageStampedEvent['body']) => {
  console.error('onMessageStamped: Not implemented')
}

export interface MessageUnstampedEvent {
  type: 'MESSAGE_UNSTAMPED'
  body: {
    message_id: MessageId
    user_id: UserId
    stamp_id: StampId
  }
}
export const onMessageUnstamped = (data: MessageUnstampedEvent['body']) => {
  console.error('onMessageUnstamped: Not implemented')
}

export interface MessagePinnedEvent {
  type: 'MESSAGE_PINNED'
  body: {
    id: MessageId
  }
}
export const onMessagePinned = (data: MessagePinnedEvent['body']) => {
  console.error('onMessagePinned: Not implemented')
}

export interface MessageUnpinnedEvent {
  type: 'MESSAGE_UNPINNED'
  body: {
    id: MessageId
  }
}
export const onMessageUnpinned = (data: MessageUnpinnedEvent['body']) => {
  console.error('onMessageUnpinned: Not implemented')
}
