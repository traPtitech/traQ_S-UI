import { promisifyRequest } from 'idb-keyval'

/**
 * 過去にクライアント側でキャッシュしていたunicodeスタンプの情報
 * 現在はHTTPキャッシュを利用するようになったので使われていない
 *
 * dbName: traQ_S-cache
 * storeName: stamps
 * key: unicode_stamps
 */

export const deleteStampCacheIDB = async () => {
  const req = indexedDB.deleteDatabase('traQ_S-cache')
  await promisifyRequest(req)
}
