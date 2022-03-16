import { ref } from 'vue'

const useHover = () => {
  const isHovered = ref(false)
  const onMouseEnter = () => {
    isHovered.value = true
  }
  const onMouseLeave = () => {
    isHovered.value = false
  }
  return {
    isHovered,
    onMouseEnter,
    onMouseLeave
  }
}

export default useHover
