import store from '@/store'
import { ChannelId, DMChannelId, UserId } from '@/types/entity-ids'
import { changeChannelById, changeDMChannelByUsername } from '@/router/channel'

const useChannelSelect = () => {
  const setUnreadState = (id: ChannelId | DMChannelId) => {
    // 未読をの処理
    // TODO: 新着メッセージ基準設定などの処理
    // TODO: 直リンクではここが叩かれない
    store.commit.domain.messagesView.unsetUnreadSince()
    const unreadChannel = store.state.domain.me.unreadChannelsSet[id]
    if (store.state.domain.me.subscriptionMap[id] > 0 && unreadChannel) {
      store.commit.domain.messagesView.setUnreadSince(unreadChannel.since)
    }
    if (id in store.state.domain.me.unreadChannelsSet) {
      store.dispatch.domain.me.readChannel({ channelId: id })
    }
  }

  const onChannelSelect = (id: ChannelId | DMChannelId) => {
    setUnreadState(id)

    // チャンネル遷移
    if (id === store.state.domain.messagesView.currentChannelId) {
      return
    }
    try {
      changeChannelById(id)
    } catch {
      throw 'Invalid Channel'
    }
  }

  const onDMChannelSelect = (username: string, userId: UserId) => {
    const dmChannelId = Object.values(store.state.entities.dmChannels).find(
      c => c.userId === userId
    )?.id

    if (dmChannelId) {
      setUnreadState(dmChannelId)

      // チャンネル遷移
      if (dmChannelId === store.state.domain.messagesView.currentChannelId) {
        return
      }
    }

    changeDMChannelByUsername(username)
  }

  return {
    onChannelSelect,
    onDMChannelSelect
  }
}

export default useChannelSelect
