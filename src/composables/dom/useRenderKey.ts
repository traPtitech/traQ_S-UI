import { computed } from 'vue'

import {
  type RenderKeyStoreId,
  useRenderKeyStore
} from '/@/store/ui/renderKeys'

export const useRenderKey = (id: RenderKeyStoreId) => {
  const { refresh: refreshImpl, get } = useRenderKeyStore()

  const refresh = () => refreshImpl(id)
  const key = computed(() => get(id))

  return {
    key,
    refresh
  }
}
