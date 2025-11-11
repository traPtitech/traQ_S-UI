import { reactive, watch } from 'vue'

import { toRawDeep } from '/@/lib/basic/reactive'
import { type Migrations, createStore } from '/@/lib/storage/localStorage'

const useLocalStorageValue = <T extends Record<string, unknown>>(
  storeName: string,
  version: number,
  migrations: Migrations<T>,
  initialValue: T
) => {
  const store = createStore<T>(storeName, version)
  const value = reactive({ ...initialValue, ...store.getAllData() })

  store.runMigrations(migrations).then(() => {
    for (const [key, val] of Object.entries(store.getAllData())) {
      // @ts-expect-error valueとvは型が一致する
      value[key] = val
    }

    watch(
      value,
      () => {
        store.saveAllData(toRawDeep(value))
      },
      { deep: true }
    )
  })

  return value
}

export default useLocalStorageValue
