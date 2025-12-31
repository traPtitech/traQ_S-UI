import { debounce } from 'throttle-debounce'

import type { Invocable } from '../types/utility'

type DebounceOptions = Parameters<typeof debounce>[2]

const flushableDebounce = <Fn extends Invocable>(
  delay: number,
  callbackImpl: Fn,
  options?: DebounceOptions
) => {
  type CallbackParams = Parameters<Fn>
  let pendingParams: CallbackParams | null = null

  const callback = (...args: CallbackParams): ReturnType<Fn> => {
    pendingParams = null
    return callbackImpl(...args)
  }

  const debounced = debounce(delay, callback, options)
  type CancelOptions = Parameters<typeof debounced.cancel>

  const cancel = (...options: CancelOptions) => {
    debounced.cancel({ upcomingOnly: true, ...options })
    pendingParams = null
  }

  const flush = () => {
    const params = pendingParams

    cancel()

    if (params) return callback(...params)
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
