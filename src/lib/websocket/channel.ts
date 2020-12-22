import apis from '@/lib/apis'
import _store from '@/_store'
import {
  ChannelUpdatedEvent,
  ChannelStaredEvent,
  ChannelUnstaredEvent,
  ChannelViewersChangedEvent,
  ChannelSubscribersChangedEvent
} from './events'

export const isCurrentChannel = (channelId: string) => {
  const primaryView = _store.state.ui.mainView.primaryView
  return (
    (primaryView.type === 'channel' || primaryView.type === 'dm') &&
    primaryView.channelId === channelId
  )
}

export const onChannelUpdated = async ({ id }: ChannelUpdatedEvent) => {
  const res = await apis.getChannel(id)

  if (isCurrentChannel(id)) {
    _store.commit.domain.messagesView.setTopic(res.data.topic)
  }
}

export const onChannelStared = (data: ChannelStaredEvent) => {
  _store.commit.domain.me.addStaredChannel(data.id)
}

export const onChannelUnstared = (data: ChannelUnstaredEvent) => {
  _store.commit.domain.me.deleteStaredChannel(data.id)
}

export const onChannelViewersChanged = (data: ChannelViewersChangedEvent) => {
  _store.commit.domain.messagesView.setCurrentViewer(data.viewers)
}

export const onChannelSubscribersChanged = async ({
  id
}: ChannelSubscribersChangedEvent) => {
  if (isCurrentChannel(id)) {
    const subscribers = (await apis.getChannelSubscribers(id)).data
    _store.commit.domain.messagesView.setSubscribers(subscribers)
  }
}
