import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

const useRefreshTokensPinia = defineStore('app/refreshTokens', () => {
  const tokens = ref(new Map<string, boolean>())

  const refresh = (key: string) => tokens.value.set(key, !tokens.value.get(key))
  const getToken = (key: string): PropertyKey => String(tokens.value.get(key))

  return { tokens, refresh, getToken }
})

export const useRefreshTokens = convertToRefsStore(useRefreshTokensPinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useRefreshTokensPinia, import.meta.hot)
  )
}
