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
  store.commit.entities.onMessageStamped(data)
}

export const onMessageUnstamped = (data: MessageUnstampedEvent['body']) => {
  store.commit.entities.onMessageUnstamped(data)
}

export const onMessagePinned = async (data: MessagePinnedEvent['body']) => {
  if (data.channel_id !== store.state.domain.messagesView.currentChannelId) {
    return
  }
  const message = await apis.getMessage(data.message_id)
  const pin = await apis.getPin(data.message_id)
  store.commit.domain.messagesView.addPinnedMessages({
    userId: pin.data.userId,
    message: message.data,
    pinnedAt: pin.data.pinnedAt
  })
}

export const onMessageUnpinned = (data: MessageUnpinnedEvent['body']) => {
  store.commit.domain.messagesView.removePinnedMessageIds(data.message_id)
}
