import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

export type RenderKeyStoreId = 'messages-scroller'

const useRenderKeyStorePinia = defineStore('ui/renderKeys', () => {
  const keys = ref(new Map<RenderKeyStoreId, boolean>())

  const refresh = (key: RenderKeyStoreId): void => {
    keys.value.set(key, !keys.value.get(key))
  }

  const get = (key: RenderKeyStoreId): string => String(keys.value.get(key))

  return { keys, refresh, get }
})

export const useRenderKeyStore = convertToRefsStore(useRenderKeyStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useRenderKeyStorePinia, import.meta.hot)
  )
}
