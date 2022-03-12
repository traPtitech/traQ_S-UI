import useChannelPath from '/@/use/channelPath'
import { computed } from 'vue'
import { useMessagesView } from '/@/store/domain/messagesView'

const useCurrentChannelPath = () => {
  const { currentChannelId } = useMessagesView()
  const { channelIdToPathString } = useChannelPath()
  const currentChannelPathString = computed(() =>
    currentChannelId.value ? channelIdToPathString(currentChannelId.value) : ''
  )
  return { currentChannelPathString }
}

export default useCurrentChannelPath
