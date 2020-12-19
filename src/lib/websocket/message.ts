import apis from '@/lib/apis'
import store from '@/store'
import _store from '@/_store'
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
import { tts } from '../tts'

const isMessageForCurrentChannel = (recievedChannelId: MessageId) => {
  const currentView = _store.state.ui.mainView.primaryView
  return (
    (currentView.type === 'channel' || currentView.type === 'dm') &&
    recievedChannelId === currentView.channelId
  )
}

export const onMessageCreated = async ({ id }: MessageCreatedEvent) => {
  const res = await apis.getMessage(id)
  _store.commit.entities.addMessage({ id, entity: res.data })

  if (store.state.entities.channelsMap.has(res.data.channelId)) {
    _store.commit.domain.addActivity(res.data)
  }

  if (res.data.userId !== _store.state.domain.me.detail?.id) {
    const userDisplayName =
      store.state.entities.usersMap.get(res.data.userId)?.displayName ??
      'はてな'
    tts.addQueue({
      channelId: res.data.channelId,
      userDisplayName,
      text: res.data.content
    })
  }

  if (!isMessageForCurrentChannel(res.data.channelId)) {
    // 未読処理
    const myId = _store.state.domain.me.detail?.id
    if (res.data.userId !== myId) {
      _store.commit.domain.me.upsertUnreadChannel(res.data)
    }
    return
  }

  await _store.dispatch.domain.messagesView.addAndRenderMessage({
    message: res.data
  })
}

export const onMessageUpdated = async ({ id }: MessageUpdatedEvent) => {
  const res = await apis.getMessage(id)
  _store.commit.entities.addMessage({ id, entity: res.data })

  if (store.state.entities.channelsMap.has(res.data.channelId)) {
    _store.commit.domain.updateActivity(res.data)
  }

  if (!isMessageForCurrentChannel(res.data.channelId)) {
    return
  }
  await _store.dispatch.domain.messagesView.updateAndRenderMessageId({
    message: res.data
  })

  // TODO: ピン止めの内容の更新
}

export const onMessageDeleted = async ({ id }: MessageDeletedEvent) => {
  _store.commit.entities.deleteMessage(id)

  _store.commit.domain.deleteActivity(id)

  _store.commit.domain.messagesView.deleteMessageId(id)
  _store.commit.domain.messagesView.removePinnedMessage(id)
}

export const onMessageRead = ({ id }: MessageReadEvent) => {
  _store.commit.domain.me.deleteUnreadChannel(id)
}

export const onMessageStamped = (data: MessageStampedEvent) => {
  _store.commit.entities.onMessageStamped(data)
}

export const onMessageUnstamped = (data: MessageUnstampedEvent) => {
  _store.commit.entities.onMessageUnstamped(data)
}

export const onMessagePinned = async (data: MessagePinnedEvent) => {
  if (!isMessageForCurrentChannel(data.channel_id)) {
    return
  }
  const [message, pin] = await Promise.all([
    apis.getMessage(data.message_id),
    apis.getPin(data.message_id)
  ])
  _store.commit.domain.messagesView.addPinnedMessages({
    userId: pin.data.userId,
    message: message.data,
    pinnedAt: pin.data.pinnedAt
  })
  if (_store.state.entities.messages[data.message_id]) {
    _store.commit.entities.extendMessages({ [data.message_id]: message.data })
  }
}

export const onMessageUnpinned = async (data: MessageUnpinnedEvent) => {
  const message = _store.state.entities.messages[data.message_id]
  if (message) {
    _store.commit.entities.extendMessages({
      [data.message_id]: { ...message, pinned: false }
    })
  }
  _store.commit.domain.messagesView.removePinnedMessage(data.message_id)
}
