import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

export type RefreshTokenStoreKey = 'messages-scroller'

const useRefreshTokensPinia = defineStore('ui/refreshTokens', () => {
  const tokens = ref(new Map<RefreshTokenStoreKey, boolean>())

  const refresh = (key: RefreshTokenStoreKey): void => {
    tokens.value.set(key, !tokens.value.get(key))
  }

  const getToken = (key: RefreshTokenStoreKey): string =>
    String(tokens.value.get(key))

  return { tokens, refresh, getToken }
})

export const useRefreshTokens = convertToRefsStore(useRefreshTokensPinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useRefreshTokensPinia, import.meta.hot)
  )
}
