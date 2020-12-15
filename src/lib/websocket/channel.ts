import apis from '@/lib/apis'
import store from '@/_store'
import {
  ChannelCreatedEvent,
  ChannelDeletedEvent,
  ChannelUpdatedEvent,
  ChannelStaredEvent,
  ChannelUnstaredEvent,
  ChannelViewersChangedEvent,
  ChannelSubscribersChangedEvent
} from './events'
import { dmParentUuid } from '@/lib/util/uuid'
import router, { constructChannelPath } from '@/router'
import useChannelPath from '@/use/channelPath'

const isCurrentChannel = (channelId: string) => {
  const primaryView = store.state.ui.mainView.primaryView
  return (
    (primaryView.type === 'channel' || primaryView.type === 'dm') &&
    primaryView.channelId === channelId
  )
}

export const onChannelCreated = async ({ id }: ChannelCreatedEvent) => {
  const res = await apis.getChannel(id)
  if (res.data.parentId === dmParentUuid) {
    // dmが既にデータにあるときは何もしない
    if (store.state.entities.dmChannels[res.data.id]) return

    // channelIdからuserIdが辿れないので全取得
    store.dispatch.entities.fetchChannels()
    return
  }

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

export const onChannelDeleted = ({ id }: ChannelDeletedEvent) => {
  store.commit.entities.deleteChannel(id)
}

export const onChannelUpdated = async ({ id }: ChannelUpdatedEvent) => {
  const { channelIdToPathString } = useChannelPath()
  const oldPath = channelIdToPathString(id)

  const res = await apis.getChannel(id)

  const old = store.state.entities.channels[id]
  const isNameChanged = old.name !== res.data.name
  const isParentChanged = old.parentId !== res.data.parentId
  const isPathChanged = isNameChanged || isParentChanged
  const isArchivedChanged = old.archived !== res.data.archived

  const diffChannels = { [id]: res.data }

  if (isParentChanged) {
    // 親チャンネルの`children`が不整合になるので再取得
    if (old.parentId) {
      const oldParentRes = await apis.getChannel(old.parentId)
      diffChannels[old.parentId] = oldParentRes.data
    }
    if (res.data.parentId) {
      const newParentRes = await apis.getChannel(res.data.parentId)
      diffChannels[res.data.parentId] = newParentRes.data
    }
  }

  store.commit.entities.extendChannels(diffChannels)

  if (isPathChanged || isArchivedChanged) {
    await store.dispatch.domain.channelTree.constructAllTrees()
  }

  if (isPathChanged) {
    const newPath = channelIdToPathString(id)
    store.dispatch.app.browserSettings.updateOpenChannelNames({
      oldName: oldPath,
      newName: newPath
    })

    if (isCurrentChannel(id)) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      router.replace(constructChannelPath(newPath)).catch(() => {})
    }
  }

  if (isCurrentChannel(id)) {
    store.commit.domain.messagesView.setTopic(res.data.topic)
  }
}

export const onChannelStared = (data: ChannelStaredEvent) => {
  store.commit.domain.me.addStaredChannel(data.id)
}

export const onChannelUnstared = (data: ChannelUnstaredEvent) => {
  store.commit.domain.me.deleteStaredChannel(data.id)
}

export const onChannelViewersChanged = (data: ChannelViewersChangedEvent) => {
  store.commit.domain.messagesView.setCurrentViewer(data.viewers)
}

export const onChannelSubscribersChanged = async ({
  id
}: ChannelSubscribersChangedEvent) => {
  if (isCurrentChannel(id)) {
    const subscribers = (await apis.getChannelSubscribers(id)).data
    store.commit.domain.messagesView.setSubscribers(subscribers)
  }
}
