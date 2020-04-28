import apis from '@/lib/apis'
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
import { MessageId } from '@/types/entity-ids'

const isMessageForCurrentChannel = (recievedChannelId: MessageId) => {
  const currentView = store.state.ui.mainView.primaryView
  return (
    (currentView.type === 'channel' || currentView.type === 'dm') &&
    recievedChannelId === currentView.channelId
  )
}

export const onMessageCreated = async ({ id }: MessageCreatedEvent['body']) => {
  const res = await apis.getMessage(id)
  store.commit.entities.addMessage({ id, entity: res.data })

  store.commit.domain.addActivity(res.data)

  if (!isMessageForCurrentChannel(res.data.channelId)) {
    return
  }
  await store.dispatch.domain.messagesView.addAndRenderMessage({
    message: res.data
  })
}

export const onMessageUpdated = async ({ id }: MessageUpdatedEvent['body']) => {
  const res = await apis.getMessage(id)
  store.commit.entities.addMessage({ id, entity: res.data })
  if (!isMessageForCurrentChannel(res.data.channelId)) {
    return
  }
  await store.dispatch.domain.messagesView.updateAndRenderMessageId({
    message: res.data
  })
}

export const onMessageDeleted = async ({ id }: MessageDeletedEvent['body']) => {
  store.commit.entities.deleteMessage(id)
  store.commit.domain.messagesView.deleteMessageId(id)
}

export const onMessageRead = (data: MessageReadEvent['body']) => {
  // TODO
}

export const onMessageStamped = (data: MessageStampedEvent['body']) => {
  store.commit.entities.onMessageStamped(data)
}

export const onMessageUnstamped = (data: MessageUnstampedEvent['body']) => {
  store.commit.entities.onMessageUnstamped(data)
}

export const onMessagePinned = async (data: MessagePinnedEvent['body']) => {
  if (!isMessageForCurrentChannel(data.channel_id)) {
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
