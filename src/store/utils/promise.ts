import { watch } from 'vue'
import { waitMount } from '/@/onMount'

export type ExtractBooleanValueKeys<T> = keyof {
  [K in keyof T as T[K] extends boolean ? K : never]: T[K]
}

/**
 * 最初にgetFetchedPropertyの返り値が`true`になったときにresolveするPromiseを返す
 */
export const createInitialFetchPromise = async (
  getFetchedProperty: () => boolean
) => {
  await waitMount
  return new Promise<void>(async resolve => {
    const stop = watch(
      getFetchedProperty,
      fetched => {
        if (fetched) {
          resolve()
          stop()
        }
      },
      { immediate: true }
    )
  })
}
