import { debounce } from 'throttle-debounce'

type DebounceParams = Parameters<typeof debounce>

const flushableDebounce = (
  ...[delay, callbackImpl, options]: DebounceParams
) => {
  type CallbackParams = Parameters<typeof callbackImpl>
  let pendingParams: CallbackParams | null = null

  const callback = (...args: CallbackParams) => {
    pendingParams = null
    callbackImpl(...args)
  }

  const debounced = debounce(delay, callback, options)
  type CancelOptions = Parameters<typeof debounced.cancel>

  const cancel = (...options: CancelOptions) => {
    debounced.cancel({ upcomingOnly: true, ...options })
    pendingParams = null
  }

  const flush = () => {
    if (pendingParams) callback(...pendingParams)
    cancel()
  }

  const register = (...args: CallbackParams) => {
    pendingParams = args
    debounced(...args)
  }

  register.cancel = cancel
  register.flush = flush

  return register
}

export default flushableDebounce
