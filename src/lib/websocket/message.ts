/* eslint-disable no-console */
import apis from '@/lib/api'
import store from '@/store'
import {
  MessageCreatedEvent,
  MessageUpdatedEvent,
  MessageDeletedEvent,
  MessageReadEvent,
  MessageStampedEvent,
  MessageUnstampedEvent,
  MessagePinnedEvent,
  MessageUnpinnedEvent
} from './events'

export const onMessageCreated = async ({ id }: MessageCreatedEvent['body']) => {
  //const res = await apis.getMessage(id)
  //store.commit.entities.addMessage({ id, entity: res.data })
  console.error('onMessageCreated: Not implemented')
}

export const onMessageUpdated = (data: MessageUpdatedEvent['body']) => {
  console.error('onMessageUpdated: Not implemented')
}

export const onMessageDeleted = (data: MessageDeletedEvent['body']) => {
  console.error('onMessageDeleted: Not implemented')
}

export const onMessageRead = (data: MessageReadEvent['body']) => {
  console.error('onMessageRead: Not implemented')
}

export const onMessageStamped = (data: MessageStampedEvent['body']) => {
  console.error('onMessageStamped: Not implemented')
}

export const onMessageUnstamped = (data: MessageUnstampedEvent['body']) => {
  console.error('onMessageUnstamped: Not implemented')
}

export const onMessagePinned = (data: MessagePinnedEvent['body']) => {
  console.error('onMessagePinned: Not implemented')
}

export const onMessageUnpinned = (data: MessageUnpinnedEvent['body']) => {
  console.error('onMessageUnpinned: Not implemented')
}
