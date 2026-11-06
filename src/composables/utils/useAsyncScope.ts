import type { WatchSource } from 'vue'
import { onScopeDispose, watch } from 'vue'

export type IsCurrentAsyncScope = () => boolean

/**
 * 非同期処理の結果が現在の表示対象に対してまだ有効かを確認する。
 *
 * 処理を始める前に capture() でチェック関数を取得し、await の後や状態を反映する前に呼ぶ。
 * sources の変更、invalidate()、Vue のスコープの破棄によって既存のチェックは失効する。
 * sources の変更は同期的に監視するため、同じ値に戻った場合も古い処理は有効にならない。
 */
const useAsyncScope = (sources: readonly WatchSource<unknown>[] = []) => {
  let controller = new AbortController()
  let disposed = false

  const invalidate = () => {
    const previous = controller
    if (!disposed) controller = new AbortController()
    const signal = controller.signal
    previous.abort()
    return signal
  }

  const capture = (): IsCurrentAsyncScope => {
    const signal = controller.signal
    return () => !signal.aborted
  }

  if (sources.length > 0) {
    // await や次の watch callback より先に古い処理を無効化する必要がある。
    watch(sources, invalidate, { flush: 'sync' })
  }

  onScopeDispose(() => {
    disposed = true
    controller.abort()
  })

  return { capture, invalidate, getSignal: () => controller.signal }
}

export default useAsyncScope
