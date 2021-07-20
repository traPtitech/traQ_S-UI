import useChannelPath from '/@/use/channelPath'
import { computed } from 'vue'
import store from '/@/store'

const useCurrentChannelPath = () => {
  const { channelIdToPathString } = useChannelPath()
  const currentChannelPathString = computed(() =>
    store.state.domain.messagesView.currentChannelId
      ? channelIdToPathString(store.state.domain.messagesView.currentChannelId)
      : ''
  )
  return { currentChannelPathString }
}

export default useCurrentChannelPath
