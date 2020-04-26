import { ref } from '@vue/composition-api'

const usePopupMenu = () => {
  const isPopupMenuShown = ref(false)
  const togglePopupMenu = () => {
    isPopupMenuShown.value = !isPopupMenuShown.value
  }
  const closePopupMenu = () => {
    isPopupMenuShown.value = false
  }
  return { isPopupMenuShown, togglePopupMenu, closePopupMenu }
}

export default usePopupMenu
