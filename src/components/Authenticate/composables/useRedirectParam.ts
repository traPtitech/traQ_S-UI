import { computed } from 'vue'
import { getFirstQuery } from '/@/lib/basic/url'
import router, { RouteName } from '/@/router'
import { useRoute } from 'vue-router'
import { sessionStorageRedirectKey } from '/@/lib/dom/storage'

const useRedirectParam = () => {
  const route = useRoute()
  const url = computed(() => getFirstQuery(route.query['redirect']))

  const redirect = () => {
    if (!url.value) {
      router.replace({ name: RouteName.Index })
      return
    }

    try {
      const u = new URL(url.value, location.href)
      if (u.origin === location.origin) {
        // /api/oauth/authorize はrouter.replaceではなくサーバーへのGETが必要
        // ref: https://github.com/traPtitech/traQ/pull/1413
        if (u.pathname === '/api/oauth/authorize') {
          location.href = url.value
          return
        }
      }
    } catch {}

    // routerでは同じドメイン内しか飛べないので特に検証していない
    router.replace(url.value)
  }

  const setRedirectSessionStorage = () => {
    if (!url.value) return

    sessionStorage.setItem(sessionStorageRedirectKey, url.value)
  }

  return { redirect, setRedirectSessionStorage }
}

export default useRedirectParam
