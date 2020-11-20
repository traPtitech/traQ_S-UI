import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import useChannelPath from '@/use/channelPath'
import { computed } from 'vue'
import { canCreateChildChannel as canCreateChildChannel_ } from '@/lib/channel'

const useChannelCreateModal = (props: { channelId: ChannelId }) => {
  const { channelIdToPathString } = useChannelPath()

  const canCreateChildChannel = computed(() =>
    canCreateChildChannel_(channelIdToPathString(props.channelId))
  )

  const openChannelCreateModal = () => {
    store.dispatch.ui.modal.pushModal({
      type: 'channel-create',
      parentChannelId: props.channelId
    })
  }
  return { canCreateChildChannel, openChannelCreateModal }
}

export default useChannelCreateModal
