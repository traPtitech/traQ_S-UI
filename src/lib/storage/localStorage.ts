import type { MaybePromise } from '/@/types/utility'

export const localStoragePrefix = 'traQ_S-'

type State = Record<string, unknown>

/**
 * インデックスが 1 のものは作成時に実行される
 * インデックスが 2 のものはバージョン 1 から 2 になるときに実行される
 */
export type Migrations<T extends State> = Record<number, Migration<T>>

type Migration<T extends State> = (T: Partial<T>) => MaybePromise<Partial<T>>

export class LocalStorageStore<T extends State> {
  private readonly fullStoreName: string

  constructor(
    private readonly storeName: string,
    private readonly version: number
  ) {
    this.fullStoreName = `${localStoragePrefix}${storeName}`
  }

  private getCurrentVersion() {
    const item = localStorage.getItem(this.fullStoreName)
    if (item === null) return 0
    const { version } = JSON.parse(item)
    return version ?? 0
  }

  private setCurrentVersion(version: number) {
    const data = this.loadAll()
    localStorage.setItem(this.fullStoreName, JSON.stringify({ version, data }))
  }

  loadAll(): Partial<T> {
    const item = localStorage.getItem(this.fullStoreName)
    if (item === null) return {}
    const { data } = JSON.parse(item)
    return data ?? {}
  }

  saveAll(data: Partial<T>) {
    localStorage.setItem(
      this.fullStoreName,
      JSON.stringify({ version: this.version, data })
    )
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    const data = this.loadAll()
    data[key] = value
    this.saveAll(data)
  }

  get<K extends keyof T>(key: K) {
    const data = this.loadAll()
    return data[key]
  }

  delete<K extends keyof T>(key: K) {
    const data = this.loadAll()
    delete data[key]
    this.saveAll(data)
  }

  keys(): (keyof T)[] {
    const data = this.loadAll()
    return Object.keys(data)
  }

  clear() {
    this.saveAll({})
  }

  destroy() {
    localStorage.removeItem(this.fullStoreName)
  }

  async runMigrations(migrations: Migrations<T>) {
    const currentVersion = this.getCurrentVersion()
    const isNewStore = currentVersion === 0

    let data = this.loadAll()

    if (isNewStore) {
      // 新規作成時のマイグレーションを実行
      const migration = migrations[1]
      if (migration) {
        try {
          data = await migration(data)
          this.setCurrentVersion(1)
          this.outputLog('log', 'Ran migration', 0)
        } catch (e) {
          this.outputLog('error', 'Failed to run migration', 0, e)
          throw e
        }
      } else {
        this.setCurrentVersion(1)
      }
    }

    // バージョンアップのマイグレーションを実行
    for (let v = this.getCurrentVersion(); v < this.version; v++) {
      const migration = migrations[v + 1]
      if (!migration) {
        this.setCurrentVersion(v + 1)
        continue
      }

      try {
        data = await migration(data)
        this.setCurrentVersion(v + 1)
        this.outputLog('log', 'Ran migration', v)
      } catch (e) {
        this.outputLog('error', 'Failed to run migration', v, e)
        throw e
      }
    }

    this.saveAll(data)
  }

  outputLog(
    level: 'log' | 'error',
    message: string,
    version: number,
    ...args: unknown[]
  ) {
    // eslint-disable-next-line no-console
    console[level](
      `[LocalStorage:migration] ${message} for "${this.fullStoreName}" v${version} to v${version + 1}`,
      ...args
    )
  }
}

export function createStore<T extends State>(
  storeName: string,
  version: number
) {
  return new LocalStorageStore<T>(storeName, version)
}
