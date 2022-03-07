import { promisifyRequest, UseStore } from 'idb-keyval'

/**
 * インデックスが1のものは作成時に実行される
 * インデックスが2のものはバージョン1から2になるときに実行される
 */
export type Migrations = Record<
  number,
  (db: IDBDatabase, tx: IDBTransaction) => Promise<void>
>

export function createStoreWithMigrations(
  dbName: string,
  storeName: string,
  version: number,
  migrations: Migrations
): UseStore {
  const request = indexedDB.open(dbName, version)
  request.onupgradeneeded = async e => {
    const db = request.result
    for (let v = e.oldVersion; v < (e.newVersion ?? e.oldVersion); v++) {
      if (v === 0) {
        db.createObjectStore(storeName)
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await migrations[v + 1]?.(db, request.transaction!)
    }
  }
  const dbp = promisifyRequest(request)

  return async (txMode, callback) => {
    const db = await dbp
    const store = db.transaction(storeName, txMode).objectStore(storeName)
    return callback(store)
  }
}
