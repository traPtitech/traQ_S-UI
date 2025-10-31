import { debounce } from 'throttle-debounce'
import { onBeforeUnmount, onMounted, onUnmounted } from 'vue'

type DebounceParams = Parameters<typeof debounce>

type Options = {
  beforeUnmounted?: boolean
  beforeUnload?: boolean
}

/**
 * unload や unmount 前にも実行される debounce
 */
const useDebounceWithAutoFlush = (
  [delay, callbackImpl, options]: DebounceParams,
  { beforeUnmounted = true, beforeUnload = true }: Options = {}
) => {
  type CallbackParams = Parameters<typeof callbackImpl>
  let pendingParams: CallbackParams | null = null

  const callback = (...args: CallbackParams) => {
    pendingParams = null
    callbackImpl(...args)
  }

  const debounced = debounce(delay, callback, options)

  const flush = () => {
    if (!pendingParams) return
    callback(...pendingParams)
  }

  const cancel = () => {
    pendingParams = null
    debounced.cancel()
  }

  if (beforeUnload) {
    onMounted(() => {
      window.addEventListener('beforeunload', flush)
    })

    onUnmounted(() => {
      if (beforeUnload) window.removeEventListener('beforeunload', flush)
    })
  }

  onBeforeUnmount(() => {
    if (beforeUnmounted) flush()
  })

  const register = (...args: CallbackParams) => {
    pendingParams = args
    debounced(...args)
  }

  register.flush = flush
  register.cancel = cancel

  return register
}

export default useDebounceWithAutoFlush
