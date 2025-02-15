import { defineStore, acceptHMRUpdate } from 'pinia'
import { toRef, unref, type Ref } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue, { key } from '/@/composables/utils/useIndexedDbValue'
import { debounce } from 'throttle-debounce'
import { promisifyRequest } from 'idb-keyval'

const useUserVolumePinia = defineStore('store/app/userVolume', () => {
  const initialValue = {
    userVolumeMap: new Map<string, number>()
  }

  const [_state, restoring, restoringPromise] = useIndexedDbValue(
    'store/app/userVolume',
    1,
    {
      1: async getStore => {
        const store = getStore()
        const setReq = store.put(initialValue, key)
        await promisifyRequest(setReq)
      }
    },
    initialValue
  )

  const state = toRef(() => _state.userVolumeMap)
  const getStore = (cId: string | Ref<string, string>) =>
    state.value.get(unref(cId))
  const setStore = (cId: string | Ref<string, string>, v: number) => {
    // 空のときは削除、空でないときはセット
    // コピーしないと参照が変わらないから上書きされる
    // toRawしちゃうとreactiveで包めなくなるので、そうはしない
    state.value.set(unref(cId), window.structuredClone(v))
  }
  const setUserVolume = debounce(100, (userId: string, volume: number) => {
    setStore(userId, volume)
  })
  return {
    getStore,
    setStore,
    setUserVolume,
    restoringPromise
  }
})

export const useUserVolume = convertToRefsStore(useUserVolumePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserVolumePinia, import.meta.hot))
}
