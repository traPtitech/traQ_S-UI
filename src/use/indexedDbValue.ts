import { createStoreWithMigrations, Migrations } from '/@/lib/dom/idb'
import { get, set } from 'idb-keyval'
import { reactive, ref, watch } from 'vue'
import { toRawDeep } from '/@/lib/basic/reactive'

const dbPrefix = 'traQ_S-'
const storeName = 'store'
const key = 'key'

const useIndexedDbValue = <T extends object>(
  dbName: string,
  version: number,
  migrations: Migrations,
  initialValue: T
) => {
  const store = createStoreWithMigrations(
    `${dbPrefix}${dbName}`,
    storeName,
    version,
    migrations
  )

  const value = reactive(initialValue)
  const loading = ref(true)
  const loadingPromise = ref(
    (async () => {
      const v = await get<T | undefined>(key, store)
      if (v) {
        for (const [key, val] of Object.entries(v)) {
          // @ts-expect-error valueとvは型が一致する
          value[key] = val
        }
      }
      loading.value = false
    })()
  )

  watch(value, async () => {
    if (loading.value) return

    // indexedDBにはproxyされたobjectは入らないのでtoRawする
    await set(key, toRawDeep(value), store)
  })

  return [value, loading, loadingPromise] as const
}

export default useIndexedDbValue
