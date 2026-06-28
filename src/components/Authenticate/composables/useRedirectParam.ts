import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { isServerRequestUrl } from '/@/lib/apis'
import { getFirstQuery } from '/@/lib/basic/url'
import { sessionStorageRedirectKey } from '/@/lib/dom/storage'
import router, { RouteName } from '/@/router'

const useRedirectParam = () => {
  const route = useRoute()
  const url = computed(() => getFirstQuery(route.query['redirect']))

  const redirect = () => {
    if (!url.value) {
      router.replace({ name: RouteName.Index })
      return
    }

    if (isServerRequestUrl(url.value)) {
      location.href = url.value
      return
    }

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
