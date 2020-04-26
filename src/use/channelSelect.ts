import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import { changeChannelById } from '@/router/channel'

const useChannelSelect = () => {
  const onChannelSelect = (id: ChannelId) => {
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
  return {
    onChannelSelect
  }
}

export default useChannelSelect
