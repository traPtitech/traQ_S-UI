import { debounce } from 'throttle-debounce'
import { ref, onMounted, onUnmounted } from 'vue'

type Option = {
  delay?: number
}

export const useInnerWindowSize = (
  fallback?: {
    width?: number
    height?: number
  },
  { delay = 64 }: Option = {}
) => {
  const width = ref<number>(fallback?.width ?? NaN)
  const height = ref<number>(fallback?.height ?? NaN)

  const updateSize = debounce(delay, () => {
    if (typeof window === 'undefined') return
    width.value = window.innerWidth
    height.value = window.innerHeight
  })

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
