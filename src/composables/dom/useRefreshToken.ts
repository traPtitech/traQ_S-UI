import { computed } from 'vue'
import {
  useRefreshTokens,
  type RefreshTokenStoreKey
} from '/@/store/ui/refreshTokens'

export const useRefreshToken = (key: RefreshTokenStoreKey) => {
  const { refresh: refreshImpl, getToken } = useRefreshTokens()

  const refresh = () => refreshImpl(key)
  const refreshToken = computed(() => getToken(key))

  return {
    refreshToken,
    refresh
  }
}
