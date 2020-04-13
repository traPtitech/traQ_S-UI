import useChannelPath from '@/use/channelPath'
import { computed } from '@vue/composition-api'
import store from '@/store'

const useCurrentChannelPath = () => {
  const { channelIdToPath } = useChannelPath()
  const currentChannelPathString = computed(() =>
    channelIdToPath(store.state.domain.messagesView.currentChannelId).join('/')
  )
  return { currentChannelPathString }
}

export default useCurrentChannelPath
