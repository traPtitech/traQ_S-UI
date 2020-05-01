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
import { UnreadChannel } from '@traptitech/traq'

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

  if (res.data.channelId in store.state.entities.channels) {
    store.commit.domain.addActivity(res.data)
  }

  if (!isMessageForCurrentChannel(res.data.channelId)) {
    // 未読処理
    const myId = store.state.domain.me.detail?.id
    if (res.data.userId !== myId) {
      const unreadChannel: UnreadChannel = {
        channelId: res.data.channelId,
        count: 1,
        noticeable: false,
        // ????
        since: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      let message = res.data.content.replace(/:.+?:/g, '')
      message = message.replace(/`.+?`/g, '')
      if (
        message.includes(
          `!{"type""@${store.state.domain.me.detail?.name}","id":"${myId}"}`
        )
      ) {
        unreadChannel.noticeable = true
      }
      if (
        res.data.channelId in store.state.domain.me.subscriptionMap ||
        unreadChannel.noticeable
      ) {
        if (res.data.channelId in store.state.domain.me.unreadChannelsSet) {
          const preUnreadChannel =
            store.state.domain.me.unreadChannelsSet[res.data.channelId]
          unreadChannel.count = preUnreadChannel.count + 1
          unreadChannel.since = preUnreadChannel.since
          store.commit.domain.me.updateUnreadChannel(unreadChannel)
        }
        store.commit.domain.me.addUnreadChannel(unreadChannel)
      }
    }
    return
  }

  await store.dispatch.domain.messagesView.addAndRenderMessage({
    message: res.data
  })
}

export const onMessageUpdated = async ({ id }: MessageUpdatedEvent['body']) => {
  const res = await apis.getMessage(id)
  store.commit.entities.addMessage({ id, entity: res.data })

  if (res.data.channelId in store.state.entities.channels) {
    store.commit.domain.updateActivity(res.data)
  }

  if (!isMessageForCurrentChannel(res.data.channelId)) {
    return
  }
  await store.dispatch.domain.messagesView.updateAndRenderMessageId({
    message: res.data
  })
}

export const onMessageDeleted = async ({ id }: MessageDeletedEvent['body']) => {
  store.commit.entities.deleteMessage(id)

  store.commit.domain.deleteActivity(id)

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
  const [message, pin] = await Promise.all([
    apis.getMessage(data.message_id),
    apis.getPin(data.message_id)
  ])
  store.commit.domain.messagesView.addPinnedMessages({
    userId: pin.data.userId,
    message: message.data,
    pinnedAt: pin.data.pinnedAt
  })
  if (store.state.entities.messages[data.message_id]) {
    store.commit.entities.extendMessages({ [data.message_id]: message.data })
  }
}

export const onMessageUnpinned = async (data: MessageUnpinnedEvent['body']) => {
  const message = store.state.entities.messages[data.message_id]
  if (message) {
    store.commit.entities.extendMessages({
      [data.message_id]: { ...message, pinned: false }
    })
  }
  store.commit.domain.messagesView.removePinnedMessageIds(data.message_id)
}
