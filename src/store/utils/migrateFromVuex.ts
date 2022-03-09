import { get, promisifyRequest, UseStore } from 'idb-keyval'

const openDBIfExists = async (dbName: string): Promise<IDBDatabase | null> => {
  let exists = true
  const request = indexedDB.open(dbName)
  request.onupgradeneeded = ({ oldVersion }) => {
    if (oldVersion === 0) {
      request.transaction?.abort()
      exists = false
    }
  }
  try {
    const db = await promisifyRequest(request)
    return db
  } catch (e) {
    if (!exists) return null
    throw e
  }
}

const createStore = (db: IDBDatabase, storeName: string): UseStore => {
  return async (txMode, callback) => {
    return callback(db.transaction(storeName, txMode).objectStore(storeName))
  }
}

export const getVuexData = async () => {
  const db = await openDBIfExists('vuex')
  if (db === null) {
    return null
  }

  const store = createStore(db, 'vuex')
  const data = await get<unknown>('vuex', store)
  return data
}
