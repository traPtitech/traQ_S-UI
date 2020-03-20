import api from '@/lib/api'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

const useChannelSelect = () => {
  const onChannelSelect = (id: ChannelId) => {
    store.dispatch.domain.messagesView.changeCurrentChannel(id)

    // 未読を除去する
    // TODO: 新着メッセージ基準設定などの処理
    if (id in store.state.domain.me.unreadChannelsSet) {
      store.dispatch.domain.me.readChannel({ channelId: id })
    }
  }
  return {
    onChannelSelect
  }
}

export default useChannelSelect
