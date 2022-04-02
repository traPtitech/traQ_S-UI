import type { Ref } from 'vue'
import { watch } from 'vue'

/**
 * 渡したrefがfalseからtrueになったときに
 * 解決するpromiseを返す
 */
export const useTrueChangedPromise = (r: Ref<boolean>) => {
  return new Promise<void>(resolve => {
    const stop = watch(r, (newR, oldR) => {
      if (oldR === false && newR === true) {
        stop()
        resolve()
      }
    })
  })
}
