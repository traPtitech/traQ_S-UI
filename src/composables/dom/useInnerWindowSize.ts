import { type ComputedRef, ref } from 'vue'

import { debounce } from 'throttle-debounce'

import createSharedComposable from '/@/lib/utils/createSharedComposable'

import useEventListener from './useEventListener'

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

const useInnerWindowSizeImpl = createSharedComposable(
  <F extends Fallback>({ fallback = {} as F, delay = 64 }: Options<F>) => {
    const width = ref(fallback.width)
    const height = ref(fallback.height)

    const updateSize = debounce(delay, () => {
      if (typeof window === 'undefined') return
      width.value = window.innerWidth
      height.value = window.innerHeight
    })

    updateSize()
    useEventListener(window, 'resize', updateSize)

    return {
      width,
      height
    }
  }
)

const useInnerWindowSize = <F extends Fallback>(options: Options<F> = {}) =>
  useInnerWindowSizeImpl(options) as Return<F>

export default useInnerWindowSize
