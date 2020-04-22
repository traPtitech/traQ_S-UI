import useChannelPath from '@/use/channelPath'
import { computed } from '@vue/composition-api'
import store from '@/store'

const useCurrentChannelPath = () => {
  const { channelIdToPathString } = useChannelPath()
  const currentChannelPathString = computed(() =>
    channelIdToPathString(store.state.domain.messagesView.currentChannelId)
  )
  return { currentChannelPathString }
}

export default useCurrentChannelPath
