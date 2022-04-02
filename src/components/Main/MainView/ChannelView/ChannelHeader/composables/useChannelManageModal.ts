import type { ChannelId } from '/@/types/entity-ids'
import { useModalStore } from '/@/store/ui/modal'

const useChannelManageModal = (props: { channelId: ChannelId }) => {
  const { pushModal } = useModalStore()

  const openChannelManageModal = () => {
    pushModal({
      type: 'channel-manage',
      id: props.channelId
    })
  }
  return { openChannelManageModal }
}

export default useChannelManageModal
