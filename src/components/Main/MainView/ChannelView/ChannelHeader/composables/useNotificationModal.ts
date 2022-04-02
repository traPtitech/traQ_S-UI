import type { ChannelId } from '/@/types/entity-ids'
import { useModalStore } from '/@/store/ui/modal'

const useNotificationModal = (props: { channelId: ChannelId }) => {
  const { pushModal } = useModalStore()

  const openNotificationModal = () => {
    pushModal({
      type: 'notification',
      channelId: props.channelId
    })
  }
  return { openNotificationModal }
}

export default useNotificationModal
