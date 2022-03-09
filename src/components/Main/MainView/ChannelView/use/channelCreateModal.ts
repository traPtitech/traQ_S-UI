import { ChannelId } from '/@/types/entity-ids'
import { computed } from 'vue'
import useCanCreateChildChannel from '/@/use/canCreateChildChannel'
import { useModalStore } from '/@/store/ui/modal'

const useChannelCreateModal = (props: { channelId: ChannelId }) => {
  const { pushModal } = useModalStore()
  const { canCreateChildChannel } = useCanCreateChildChannel()

  const isChildChannelCreatable = computed(() =>
    canCreateChildChannel(props.channelId)
  )

  const openChannelCreateModal = () => {
    pushModal({
      type: 'channel-create',
      parentChannelId: props.channelId
    })
  }
  return { isChildChannelCreatable, openChannelCreateModal }
}

export default useChannelCreateModal
