import type { WatchSource } from 'vue'
import { onScopeDispose, ref, shallowRef, toValue, watch } from 'vue'

import useAsyncScope from './useAsyncScope'

interface LatestRequestOptions<Source, Result> {
  source: WatchSource<Source>
  fetch: (source: Source, signal: AbortSignal) => Promise<Result>

  onSuccess: (result: Result, source: Source) => void
  onError?: (error: unknown) => void

  autoLoad?: boolean
}

/**
 * 最後に開始した取得だけを onSuccess に反映する。
 * 再実行・source の変更・スコープ破棄で以前の取得をキャンセルする。
 */
const useLatestRequest = <Source, Result>(
  options: LatestRequestOptions<Source, Result>
) => {
  const scope = useAsyncScope()
  const isLoading = ref(false)
  const error = shallowRef<unknown>()

  const reset = () => {
    isLoading.value = false
    error.value = undefined
    return scope.invalidate()
  }

  onScopeDispose(reset)

  const execute = async () => {
    const signal = reset()
    const isCurrent = () => !signal.aborted
    if (!isCurrent()) return

    const source = toValue(options.source)
    isLoading.value = true
    if (!isCurrent()) return

    let onAbort!: () => void
    const aborted = new Promise<never>((_, reject) => {
      onAbort = () => reject(signal.reason)
      signal.addEventListener('abort', onAbort, { once: true })
    })

    try {
      const result = await Promise.race([
        options.fetch(source, signal),
        aborted
      ])
      if (!isCurrent()) return

      options.onSuccess(result, source)
      if (isCurrent()) return result
    } catch (cause) {
      if (isCurrent()) {
        error.value = cause
        options.onError?.(cause)
        throw cause
      }
    } finally {
      signal.removeEventListener('abort', onAbort)
      if (isCurrent()) isLoading.value = false
    }
  }

  watch(
    options.source,
    () => {
      if (options.autoLoad === false) reset()
      else {
        void execute().catch(() => undefined)
      }
    },
    { flush: 'sync', immediate: options.autoLoad !== false }
  )

  return {
    execute,
    reset,
    isLoading,
    error
  }
}

export default useLatestRequest
