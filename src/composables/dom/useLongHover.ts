import { ref } from 'vue'

const useLongHover = (longHoverTime = 500) => {
  const isLongHovered = ref(false)
  const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

  const onMouseEnter = () => {
    hoverTimeout.value = setTimeout(() => {
      isLongHovered.value = true
    }, longHoverTime)
  }
  const onMouseLeave = () => {
    if (hoverTimeout.value) clearTimeout(hoverTimeout.value)
    isLongHovered.value = false
  }

  return {
    isLongHovered,
    onMouseEnter,
    onMouseLeave
  }
}

export default useLongHover
