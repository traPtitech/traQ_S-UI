import { SetupContext } from '@vue/composition-api'
import store from '@/store'
import useChannelPath from '@/use/channelPath'
import { ChannelId } from '@/types/entity-ids'
import { constructChannelPath } from '@/router'

const useChannelSelect = (context: SetupContext) => {
  const { channelIdToPath } = useChannelPath()

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
      const channelPath = channelIdToPath(id)
      context.root.$router.push(constructChannelPath(channelPath.join('/')))
    } catch {
      throw 'Invalid Channel'
    }
  }
  return {
    onChannelSelect
  }
}

export default useChannelSelect
