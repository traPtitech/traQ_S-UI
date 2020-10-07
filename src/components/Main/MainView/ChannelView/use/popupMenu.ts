import { ref } from 'vue'

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
