import { AsyncStorage } from 'vuex-persist'
import { createStore, get, set, del, clear, keys } from 'idb-keyval'
import { toRawDeep } from '/@/lib/basic/reactive'

const store = createStore('vuex', 'vuex')

const indexedDBStorage: AsyncStorage = {
  async getItem(key) {
    const res = get(key, store)
    return res
  },
  async setItem(key, val) {
    // indexedDBにはproxyされたobjectは入らないのでtoRawする
    await set(key, toRawDeep(val), store)
    const res = get(key, store)
    return res
  },
  removeItem(key) {
    return del(key, store)
  },
  clear() {
    return clear(store)
  },
  async length() {
    const ks = await keys(store)
    return ks.length
  },
  async key(keyIndex) {
    const ks = await keys(store)
    return ks[keyIndex] as string // keyName is limited to string
  }
}

export default indexedDBStorage
