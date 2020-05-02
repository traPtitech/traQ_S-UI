import store from '@/store'
import { ChannelId, DMChannelId, UserId } from '@/types/entity-ids'
import { changeChannelById, changeDMChannelByUsername } from '@/router/channel'

const useChannelSelect = () => {
  const onChannelSelect = (id: ChannelId | DMChannelId) => {
    // 未読を除去する
    // TODO: 新着メッセージ基準設定などの処理
    if (id in store.state.domain.me.unreadChannelsSet) {
      store.dispatch.domain.me.readChannel({ channelId: id })
    }

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
      // 未読を除去する
      // TODO: 新着メッセージ基準設定などの処理
      if (dmChannelId in store.state.domain.me.unreadChannelsSet) {
        store.dispatch.domain.me.readChannel({ channelId: dmChannelId })
      }

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
