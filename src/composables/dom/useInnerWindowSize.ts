import { debounce } from 'throttle-debounce'
import { ref, onMounted, onUnmounted, type ComputedRef } from 'vue'

type Fallback = {
  width?: number
  height?: number
}

type Options<F extends Fallback = object> = {
  fallback?: F
  delay?: number
}

type ReturnWidth<F> =
  | number
  | (F extends { width: infer T extends number } ? T : undefined)

type ReturnHeight<F> =
  | number
  | (F extends { height: infer T extends number } ? T : undefined)

type Return<F> = {
  width: ComputedRef<ReturnWidth<F>>
  height: ComputedRef<ReturnHeight<F>>
}

function useInnerWindowSize<F extends Fallback>({
  fallback = {} as F,
  delay = 64
}: Options<F> = {}) {
  const width = ref(fallback.width)
  const height = ref(fallback.height)

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
  } as Return<F>
}

export { useInnerWindowSize }

export default useInnerWindowSize
