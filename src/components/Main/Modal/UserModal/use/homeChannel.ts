import { ref, Ref } from '@vue/composition-api'
import store from '@/store'
import useHomeChannelPath from '@/use/homeChannelPath'

const useHomeChannel = (username: Ref<string>) => {
  const { homeChannelFromUsername } = useHomeChannelPath()

  const exists = ref(false)

  const channelId = homeChannelFromUsername(
    username.value,
    store.state.domain.channelTree.channelTree
  )
  const onClick = () => {
    if (channelId === undefined) return
    store.dispatch.domain.messagesView.changeCurrentChannel(channelId)
  }

  return {
    homeChannelExists: exists,
    onHomeChannelClick: onClick
  }
}

export default useHomeChannel
