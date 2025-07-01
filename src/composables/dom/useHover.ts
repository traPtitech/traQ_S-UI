import { ref } from 'vue'
import useToggle from '/@/composables/utils/useToggle'

const useHover = (LongHoverTime = 500) => {
  const { value: isHovered, open, close } = useToggle()
  const isLongHovered = ref(false)
  const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
  const onMouseEnter = () => {
    open()
    isHovered.value = true
    hoverTimeout.value = setTimeout(() => {
      if (isHovered.value) {
        isLongHovered.value = true
      }
    }, LongHoverTime)
  }
  const onMouseLeave = () => {
    close()
    if (hoverTimeout.value) clearTimeout(hoverTimeout.value)
    isLongHovered.value = false
  }
  return {
    isHovered,
    isLongHovered,
    onMouseEnter,
    onMouseLeave
  }
}

export default useHover
