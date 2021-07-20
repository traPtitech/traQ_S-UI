import { UserDetail } from '@traptitech/traq'

/**
 * IndexedDBに保存されているStoreの状態
 */
type PStore = {
  domain: {
    me: {
      detail: UserDetail
    }
  }
}

export const getStore = async (): Promise<
  PStore | Record<string, never> | null
> => {
  try {
    const dbEvent = await new Promise<Event>((resolve, reject) => {
      const openReq = indexedDB.open('vuex')
      openReq.onsuccess = resolve
      openReq.onerror = reject
    })
    const db = (dbEvent.target as IDBOpenDBRequest).result
    const storeEvent = await new Promise<Event>((resolve, reject) => {
      const getReq = db.transaction('vuex').objectStore('vuex').get('vuex')
      getReq.onsuccess = resolve
      getReq.onerror = reject
    })
    return (storeEvent.target as IDBRequest<PStore | Record<string, never>>)
      .result
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[sw] failed to get store: ${e}`)
    return null
  }
}
