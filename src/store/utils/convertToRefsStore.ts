import {
  storeToRefs,
  Pinia,
  Store,
  StoreGeneric,
  StoreState,
  StoreGetters,
  PiniaCustomStateProperties
} from 'pinia'
import { isReactive, isRef, toRaw, ToRefs } from 'vue'

/**
 * `storeToRefs`の返り値の型
 */
type StoreToRefs<SS> = ToRefs<
  StoreState<SS> & StoreGetters<SS> & PiniaCustomStateProperties<StoreState<SS>>
>

type ToRefsedStore<SS> = Omit<SS, keyof StoreToRefs<SS>> & StoreToRefs<SS>

export const convertToRefsStore = <SS extends Store>(
  useStore: (pinia?: Pinia | null | undefined, hot?: StoreGeneric) => SS
) => {
  return (
    pinia?: Pinia | null | undefined,
    hot?: StoreGeneric
  ): ToRefsedStore<SS> => {
    const store = useStore(pinia, hot)

    if (!import.meta.env.PROD) {
      const rawStore = toRaw(store)
      /*
       * useStoreでRefやReactiveでない型を返すことはできるが、
       * 返り値の型がRefで包まれない状態のままになるように型を実装していないことと、
       * useStoreでそのような値を返すことはほぼないことから
       * 含まれていた場合にエラーを出すようにしている
       */
      for (const key in rawStore) {
        const v = rawStore[key]
        if (typeof v === 'function') continue
        if (isRef(v) || isReactive(v)) continue
        // piniaの内部プロパティ
        if (key.startsWith('_') || key.startsWith('$')) continue
        throw new Error(
          'storeから関数でないRefやReactiveで包まれていない値を返すことはできません。' +
            `Type: ${typeof v}, ToString: ${v}`
        )
      }
    }

    return {
      ...store,
      ...storeToRefs(store)
    }
  }
}
