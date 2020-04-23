import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

const useChannelCreateModal = (props: { channelId: ChannelId }) => {
  const openChannelCreateModal = () => {
    store.dispatch.ui.modal.pushModal({
      type: 'channel-create',
      parentChannelId: props.channelId
    })
  }
  return { openChannelCreateModal }
}

export default useChannelCreateModal
