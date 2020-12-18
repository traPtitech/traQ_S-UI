import apis from '@/lib/apis'
import _store from '@/_store'
import store from '@/store'
import {
  ChannelCreatedEvent,
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
  const primaryView = _store.state.ui.mainView.primaryView
  return (
    (primaryView.type === 'channel' || primaryView.type === 'dm') &&
    primaryView.channelId === channelId
  )
}

export const onChannelCreated = async ({ id }: ChannelCreatedEvent) => {
  const res = await apis.getChannel(id)
  if (res.data.parentId === dmParentUuid) {
    // dmが既にデータにあるときは何もしない
    if (store.state.entities.dmChannelsMap.has(res.data.id)) return

    // channelIdからuserIdが辿れないので全取得
    store.dispatch.entities.fetchChannels()
    return
  }

  store.commit.entities.setChannel(res.data)
  if (res.data.parentId) {
    // 親チャンネルの`children`が不整合になるので再取得
    const parentRes = await apis.getChannel(res.data.parentId)
    store.commit.entities.setChannel(parentRes.data)
  }
  await _store.dispatch.domain.channelTree.constructChannelTree()
}

export const onChannelUpdated = async ({ id }: ChannelUpdatedEvent) => {
  const { channelIdToPathString } = useChannelPath()
  const oldPath = channelIdToPathString(id)

  const res = await apis.getChannel(id)

  // TODO: なかったときの考慮
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const old = store.state.entities.channelsMap.get(id)!
  const isNameChanged = old.name !== res.data.name
  const isParentChanged = old.parentId !== res.data.parentId
  const isPathChanged = isNameChanged || isParentChanged
  const isArchivedChanged = old.archived !== res.data.archived

  store.commit.entities.setChannel(res.data)

  if (isParentChanged) {
    // 親チャンネルの`children`が不整合になるので再取得
    if (old.parentId) {
      const oldParentRes = await apis.getChannel(old.parentId)
      store.commit.entities.setChannel(oldParentRes.data)
    }
    if (res.data.parentId) {
      const newParentRes = await apis.getChannel(res.data.parentId)
      store.commit.entities.setChannel(newParentRes.data)
    }
  }

  if (isPathChanged || isArchivedChanged) {
    await _store.dispatch.domain.channelTree.constructAllTrees()
  }

  if (isPathChanged) {
    const newPath = channelIdToPathString(id)
    _store.dispatch.app.browserSettings.updateOpenChannelNames({
      oldName: oldPath,
      newName: newPath
    })

    if (isCurrentChannel(id)) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      router.replace(constructChannelPath(newPath)).catch(() => {})
    }
  }

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
