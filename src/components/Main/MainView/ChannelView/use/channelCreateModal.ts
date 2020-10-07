import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import useChannelPath from '@/use/channelPath'
import { computed } from 'vue'
import { MAX_CHILD_LEVEL } from '@/lib/validator'

const useChannelCreateModal = (props: { channelId: ChannelId }) => {
  const { channelIdToPath } = useChannelPath()

  const canCreateChildChannel = computed(
    () => channelIdToPath(props.channelId).length < MAX_CHILD_LEVEL
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
