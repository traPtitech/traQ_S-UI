import store from '@/store'

const useGroupCreateModalOpener = () => {
  const openGroupCreateModal = () => {
    store.dispatch.ui.modal.pushModal({
      type: 'group-create'
    })
  }

  return { openGroupCreateModal }
}

export default useGroupCreateModalOpener
