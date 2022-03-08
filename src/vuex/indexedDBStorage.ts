import { createStore, get, set, del, clear, keys } from 'idb-keyval'
import { toRawDeep } from '/@/lib/basic/reactive'

const store = createStore('vuex', 'vuex')

const indexedDBStorage = {
  async getItem(key: string) {
    const res = get(key, store)
    return res
  },
  async setItem(key: string, val: unknown) {
    // indexedDBにはproxyされたobjectは入らないのでtoRawする
    await set(key, toRawDeep(val), store)
    const res = get(key, store)
    return res
  },
  removeItem(key: string) {
    return del(key, store)
  },
  clear() {
    return clear(store)
  },
  async length() {
    const ks = await keys(store)
    return ks.length
  },
  async key(keyIndex: number) {
    const ks = await keys(store)
    return ks[keyIndex] as string // keyName is limited to string
  }
}

export default indexedDBStorage
