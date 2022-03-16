import { useModalStore } from '/@/store/ui/modal'

const useGroupCreateModalOpener = () => {
  const { pushModal } = useModalStore()

  const openGroupCreateModal = () => {
    pushModal({
      type: 'group-create'
    })
  }

  return { openGroupCreateModal }
}

export default useGroupCreateModalOpener
