import store from '/@/vuex'
import { ChannelId } from '/@/types/entity-ids'

const useNotificationModal = (props: { channelId: ChannelId }) => {
  const openNotificationModal = () => {
    store.dispatch.ui.modal.pushModal({
      type: 'notification',
      channelId: props.channelId
    })
  }
  return { openNotificationModal }
}

export default useNotificationModal
