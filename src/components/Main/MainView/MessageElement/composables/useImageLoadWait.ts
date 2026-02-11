import { type Ref, type WatchStopHandle, watch } from 'vue'

import { wait } from '/@/lib/basic/timer'

/**
 * 要素内の画像読み込み完了を待機する
 * @param elementRef 監視対象の要素
 * @param timeoutMs タイムアウト（ミリ秒）
 * @returns 完了したかどうか（タイムアウトした場合もtrueになるが、実用上は完了扱いとする）
 */
export const useImageLoadWait = (
  elementRef: Ref<HTMLElement | null>,
  timeoutMs = 3000
) => {
  return new Promise<void>(resolve => {
    let stop: WatchStopHandle | null = null
    stop = watch(
      elementRef,
      async element => {
        if (!element) return
        if (stop) stop()

        const images = Array.from(element.querySelectorAll('img'))
        if (images.length === 0) {
          resolve()
          return
        }

        const promises = images.map(img => {
          if (img.complete) return Promise.resolve()
          return new Promise<void>(r => {
            img.addEventListener('load', () => r(), { once: true })
            img.addEventListener('error', () => r(), { once: true })
          })
        })

        // タイムアウト用Promise
        const timeout = wait(timeoutMs)

        await Promise.race([Promise.all(promises), timeout])
        resolve()
      },
      { immediate: true, flush: 'post' } // DOM描画後に実行
    )
  })
}
