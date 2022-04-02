import {
  promisifyRequest,
  createStore as idbCreateStore,
  UseStore
} from 'idb-keyval'

export const dbPrefix = 'traQ_S-'

/**
 * インデックスが1のものは作成時に実行される
 * インデックスが2のものはバージョン1から2になるときに実行される
 */
export type Migrations = Record<number, Migration>

/**
 * migration内ではasyncにできないので独自に行う
 * ここではIDBのストア自体のスキーマが変わることはないので、
 * バージョンをあげてから行うことにする
 * asyncにできないのはtransactionが終わってしまうため
 * 参考: https://stackoverflow.com/q/42700663
 */
type Migration = (getStore: () => IDBObjectStore) => void | Promise<void>

const outputLog = (
  level: 'log' | 'error',
  message: string,
  dbName: string,
  version: number,
  ...args: unknown[]
) => {
  // eslint-disable-next-line no-console
  console[level](
    `[migration] ${message} for "${dbName}" v${version} to v${version + 1}`,
    ...args
  )
}

export function createStoreWithMigrations(
  dbName: string,
  storeName: string,
  version: number,
  migrations: Migrations
): UseStore {
  const dbNameWithPrefix = `${dbPrefix}${dbName}`

  const dbp = (async () => {
    let created = false
    const request = indexedDB.open(dbNameWithPrefix)
    request.onupgradeneeded = () => {
      // 存在しなかった場合
      request.result.createObjectStore(storeName)
      created = true
    }
    let db = await promisifyRequest(request)

    if (created) {
      // 作成時のmigrationを実行する
      const migration = migrations[1]
      if (migration) {
        try {
          const getStore = () =>
            db.transaction(storeName, 'readwrite').objectStore(storeName)
          await migration(getStore)
          outputLog('log', 'Ran migration', dbNameWithPrefix, 0)
        } catch (e) {
          outputLog('error', 'Failed to run migration', dbNameWithPrefix, 0)
          throw e
        }
      }
    }

    if (db.version === version) {
      // migrationが必要ないのでそのまま返す
      return db
    }

    // run migration
    for (let v = db.version; v < version; v++) {
      const migration = migrations[v + 1]
      if (!migration) continue

      try {
        const getStore = () =>
          db.transaction(storeName, 'readwrite').objectStore(storeName)
        await migration(getStore)
        outputLog('log', 'Ran migration', dbNameWithPrefix, v)
      } catch (e) {
        outputLog('error', 'Failed to run migration', dbNameWithPrefix, v)
        throw e
      }

      try {
        // migrationに成功したらバージョンを上げる
        db.close()
        const updateRequest = indexedDB.open(dbNameWithPrefix, v + 1)
        db = await promisifyRequest(updateRequest)
      } catch (e) {
        outputLog('error', 'Failed to upgrade version', dbNameWithPrefix, v, e)
        throw e
      }
    }

    return db
  })()

  return async (txMode, callback) => {
    const db = await dbp
    const store = db.transaction(storeName, txMode).objectStore(storeName)
    return callback(store)
  }
}

export function createStore(dbName: string, storeName: string): UseStore {
  return idbCreateStore(`${dbPrefix}${dbName}`, storeName)
}
