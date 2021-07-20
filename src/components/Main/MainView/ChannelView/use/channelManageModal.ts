import store from '/@/store'
import { ChannelId } from '/@/types/entity-ids'

const useChannelManageModal = (props: { channelId: ChannelId }) => {
  const openChannelManageModal = () => {
    store.dispatch.ui.modal.pushModal({
      type: 'channel-manage',
      id: props.channelId
    })
  }
  return { openChannelManageModal }
}

export default useChannelManageModal
