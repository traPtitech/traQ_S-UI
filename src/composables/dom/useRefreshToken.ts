import { computed } from 'vue'
import { useRefreshTokens } from '/@/store/ui/refreshTokens'

export const useRefreshToken = (key: string) => {
  const { refresh: refreshImpl, getToken } = useRefreshTokens()

  const refresh = () => refreshImpl(key)
  const refreshToken = computed(() => getToken(key))

  return {
    refreshToken,
    refresh
  }
}
