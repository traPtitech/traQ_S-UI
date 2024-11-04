import type { Migrations } from '/@/lib/dom/idb'
import { createStoreWithMigrations } from '/@/lib/dom/idb'
import { get, set } from 'idb-keyval'
import { reactive, ref, watch } from 'vue'
import { toRawDeep } from '/@/lib/basic/reactive'

export const storeName = 'store'
export const key = 'key'

const useIndexedDbValue = <T extends object>(
  dbName: string,
  version: number,
  migrations: Migrations,
  initialValue: T
) => {
  const store = createStoreWithMigrations(
    dbName,
    storeName,
    version,
    migrations
  )

  const value = reactive(initialValue)
  const restoring = ref(true)
  const restoringPromise = ref(
    (async () => {
      const v = await get<T | undefined>(key, store)
      if (v) {
        for (const [key, val] of Object.entries(v)) {
          // @ts-expect-error valueとvは型が一致する
          value[key] = val
        }
      }
      restoring.value = false
    })()
  )

  watch(
    value,
    async () => {
      if (restoring.value) return
      // indexedDBにはproxyされたobjectは入らないのでtoRawする
      await set(key, toRawDeep(value), store)
    },
    { deep: true }
  )

  return [value, restoring, restoringPromise] as const
}

export default useIndexedDbValue
