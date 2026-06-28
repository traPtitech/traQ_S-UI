import type { Ref } from 'vue'
import { watch } from 'vue'

import { isObjectAndHasKey } from '/@/lib/basic/object'

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

export const isPromiseLike = (x: unknown): x is PromiseLike<unknown> => {
  if (!isObjectAndHasKey(x, 'then')) return false
  return typeof x.then === 'function'
}
