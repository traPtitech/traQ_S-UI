import { useModalStore } from '/@/store/ui/modal'
import type { ChannelId } from '/@/types/entity-ids'

const useThreadManageModal = (props: { channelId: ChannelId }) => {
  const { pushModal } = useModalStore()

  const openChannelManageModal = () => {
    pushModal({
      type: 'channel-manage',
      id: props.channelId
    })
  }
  return { openChannelManageModal }
}

export default useThreadManageModal
