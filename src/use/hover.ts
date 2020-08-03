import { SetupContext, ref } from 'vue'

const useHover = (context?: SetupContext) => {
  const isHovered = ref(false)
  const onMouseEnter = () => {
    if (context) {
      context.emit('hover')
    }
    isHovered.value = true
  }
  const onMouseLeave = () => {
    if (context) {
      context.emit('hover-end')
    }
    isHovered.value = false
  }
  return {
    isHovered,
    onMouseEnter,
    onMouseLeave
  }
}

export default useHover
