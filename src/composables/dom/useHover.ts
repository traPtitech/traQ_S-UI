import { computed, ref } from 'vue'
import { useResponsiveStore } from '/@/store/ui/responsive'

const useHover = () => {
  const { isTouchDevice } = useResponsiveStore()

  const isTapHovered = ref(false)
  const isMouseHovered = ref(false)
  const isHovered = computed(() =>
    isTouchDevice.value ? isTapHovered.value : isMouseHovered.value
  )

  const onMouseEnter = () => {
    isMouseHovered.value = true
  }
  const onMouseLeave = () => {
    isTapHovered.value = false
    isMouseHovered.value = false
  }
  const onClick = () => {
    isTapHovered.value = true
  }

  return {
    isHovered,
    onMouseEnter,
    onMouseLeave,
    onClick
  }
}

export default useHover
