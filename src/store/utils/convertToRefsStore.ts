import { isReactive, isRef, toRaw } from 'vue'

import type { Pinia, Store, StoreGeneric } from 'pinia'
import { storeToRefs } from 'pinia'

import { isPromiseLike } from './promise'

type StoreToRefs<SS extends Store> = ReturnType<typeof storeToRefs<SS>>
type ToRefsedStore<SS extends Store> = Omit<SS, keyof StoreToRefs<SS>> &
  StoreToRefs<SS>

export const convertToRefsStore = <SS extends Store>(
  useStore: (pinia?: Pinia | null | undefined, hot?: StoreGeneric) => SS
) => {
  let prevPinia: Pinia | null | undefined
  let prevHot: StoreGeneric | undefined
  let prevResult: ToRefsedStore<SS> | undefined

  return (
    pinia?: Pinia | null | undefined,
    hot?: StoreGeneric
  ): ToRefsedStore<SS> => {
    /*
     * 呼び出すたびに変換するのはコストがかかるので、
     * 同じものであればキャッシュする
     * 本番ではpiniaとhotが変わることは多くないので一つしかキャッシュしない
     */
    if (prevPinia === pinia && prevHot === hot && prevResult !== undefined) {
      return prevResult
    }

    const store = useStore(pinia, hot)

    if (!import.meta.env.PROD) {
      const rawStore = toRaw(store)
      /*
       * useStore で Ref や Reactive でない型を返すことはできるが、
       * 返り値の型が Ref で包まれない状態のままになるように型を実装していないことと、
       * useStore でそのような値を返すことはほぼないことから
       * 含まれていた場合にエラーを出すようにしている
       */
      for (const key in rawStore) {
        const v = rawStore[key]
        if (typeof v === 'function') continue
        if (isPromiseLike(v)) continue
        if (isRef(v) || isReactive(v)) continue
        // piniaの内部プロパティ
        if (key.startsWith('_') || key.startsWith('$')) continue
        throw new Error(
          'store から Function や Promise でない非リアクティブ値を返すことはできません' +
            `Type: ${typeof v}, ToString: ${v}`
        )
      }
    }

    const result = {
      ...store,
      ...storeToRefs(store)
    }

    prevPinia = pinia
    prevHot = hot
    prevResult = result

    return result
  }
}
