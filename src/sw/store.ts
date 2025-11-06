import { promisifyRequest } from 'idb-keyval'

import { key, storeName } from '/@/composables/utils/useIndexedDbValue'
import { dbPrefix } from '/@/lib/dom/idb'
import type { IDBState } from '/@/store/domain/me'

export const getMeStore = async () => {
  try {
    const openReq = indexedDB.open(`${dbPrefix}store/domain/me`)
    const db = await promisifyRequest(openReq)
    const getReq: IDBRequest<IDBState> = db
      .transaction(storeName)
      .objectStore(storeName)
      .get(key)
    const store = await promisifyRequest(getReq)
    return store
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[sw] failed to get me store: ${e}`)
    return null
  }
}
