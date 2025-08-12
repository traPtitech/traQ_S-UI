import { ref, onMounted, onUnmounted } from 'vue'

export const useInnerWindowSize = (fallback?: {
  width?: number
  height?: number
}) => {
  const width = ref<number>(fallback?.width ?? NaN)
  const height = ref<number>(fallback?.height ?? NaN)

  const updateSize = () => {
    if (typeof window === 'undefined') return
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  return {
    width,
    height
  }
}

export default useInnerWindowSize
