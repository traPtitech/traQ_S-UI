import store from '/@/store'
import { ChannelId } from '/@/types/entity-ids'
import { computed } from 'vue'
import useCanCreateChildChannel from '/@/use/canCreateChildChannel'

const useChannelCreateModal = (props: { channelId: ChannelId }) => {
  const { canCreateChildChannel } = useCanCreateChildChannel()

  const isChildChannelCreatable = computed(() =>
    canCreateChildChannel(props.channelId)
  )

  const openChannelCreateModal = () => {
    store.dispatch.ui.modal.pushModal({
      type: 'channel-create',
      parentChannelId: props.channelId
    })
  }
  return { isChildChannelCreatable, openChannelCreateModal }
}

export default useChannelCreateModal
