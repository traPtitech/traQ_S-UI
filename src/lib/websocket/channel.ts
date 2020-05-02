import apis from '@/lib/apis'
import store from '@/store'
import {
  ChannelCreatedEvent,
  ChannelDeletedEvent,
  ChannelUpdatedEvent,
  ChannelStaredEvent,
  ChannelUnstaredEvent,
  ChannelViewersChangedEvent
} from './events'

const isCurrentChannel = (channelId: string) => {
  const primaryView = store.state.ui.mainView.primaryView
  return (
    (primaryView.type === 'channel' || primaryView.type === 'dm') &&
    primaryView.channelId === channelId
  )
}

export const onChannelCreated = async ({ id }: ChannelCreatedEvent['body']) => {
  const res = await apis.getChannel(id)
  store.commit.entities.addChannel({ id, entity: res.data })
  if (res.data.parentId) {
    // 親チャンネルの`children`が不整合になるので再取得
    const parentRes = await apis.getChannel(res.data.parentId)
    store.commit.entities.addChannel({
      id: parentRes.data.id,
      entity: parentRes.data
    })
  }
  await store.dispatch.domain.channelTree.constructChannelTree()
}

export const onChannelDeleted = ({ id }: ChannelDeletedEvent['body']) => {
  store.commit.entities.deleteChannel(id)
}

export const onChannelUpdated = async ({ id }: ChannelUpdatedEvent['body']) => {
  const res = await apis.getChannel(id)
  store.commit.entities.extendChannels({ [id]: res.data })
  if (isCurrentChannel(id)) {
    store.commit.domain.messagesView.setTopic(res.data.topic)
  }
}

export const onChannelStared = (data: ChannelStaredEvent['body']) => {
  store.commit.domain.me.addStaredChannel(data.id)
}

export const onChannelUnstared = (data: ChannelUnstaredEvent['body']) => {
  store.commit.domain.me.deleteStaredChannel(data.id)
}

export const onChannelViewersChanged = (
  data: ChannelViewersChangedEvent['body']
) => {
  store.commit.domain.messagesView.setCurrentViewer(data.viewers)
}
