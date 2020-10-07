import { AsyncStorage } from 'vuex-persist'
import { Store, get, set, del, clear, keys } from 'idb-keyval'
import { toRawDeep } from '@/lib/util/reactive'

const store = new Store('vuex', 'vuex')

const indexedDBStorage: AsyncStorage = {
  getItem(key) {
    return get(key, store)
  },
  async setItem(key, val) {
    // indexedDBにはproxyされたobjectは入らないのでtoRawする
    await set(key, toRawDeep(val), store)
    return get(key, store)
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
