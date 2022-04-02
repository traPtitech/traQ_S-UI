import type { AxiosResponse } from 'axios'
import type { Ref } from 'vue'

// TODO: fetchのエラー処理

/**
 * キャッシュを使うかどうかと全取得が完了するまで待つか
 * forceFetch: キャッシュを一切利用しない
 * useCache: あればキャッシュを利用して、全取得が終わってない場合でもそれを待たずに取得する
 * waitForAllFetch: 全取得が完了してから取得が必要なときだけ取得する
 */
export type CacheStrategy = 'forceFetch' | 'useCache' | 'waitForAllFetch'

/**
 * キャッシュを使いつつ単体を取得する
 * @param cacheStrategy CacheStrategy型を参照
 * @param map usersMapのように一覧が格納されているMap
 * @param key MapのKey、usersMapならuserId
 * @param fetched 全件取得が完了したか、例えばusersMapFetched
 * @param fetch singleflight化した取得関数
 * @param set 取得が発生したときに行うcommit
 * @returns 取得結果
 *
 * @see [traQ_S-UI#1699](https://github.com/traPtitech/traQ_S-UI/pull/1699#issuecomment-747115101)
 */
export const fetchWithCacheStrategy = async <K, V>(
  cacheStrategy: CacheStrategy,
  map: Ref<Map<K, V>>,
  key: K,
  fetched: boolean,
  initialFetchPromise: Promise<void>,
  fetch: (key: K) => Promise<[AxiosResponse<V>, boolean]>,
  set: (res: V) => void
): Promise<V> => {
  // キャッシュを利用する場合はこのブロックに入る
  if (cacheStrategy === 'useCache' || cacheStrategy === 'waitForAllFetch') {
    const res = map.value.get(key)
    if (res) {
      return res
    }

    // キャッシュに存在してなかったかつ、全取得が完了してない場合は
    // 全取得を待って含まれてるか確認する
    if (cacheStrategy === 'waitForAllFetch' && !fetched) {
      await initialFetchPromise

      // 参照が変わっているので取り直す
      const res = map.value.get(key)
      if (res) {
        return res
      }
    }
  }

  const [{ data: res }, isShared] = await fetch(key)
  // 他の取得とまとめられていた場合は既にcommitされてるためcommitしない
  if (!isShared) {
    set(res)
  }
  return res
}
