import { computed } from 'vue'
import { getFirstQuery } from '/@/lib/basic/url'
import router, { RouteName } from '/@/router'
import { useRoute } from 'vue-router'

const useRedirectParam = () => {
  const route = useRoute()
  const url = computed(() => getFirstQuery(route.query['redirect']))

  const redirect = () => {
    if (!url.value) {
      router.replace({ name: RouteName.Index })
      return
    }

    // routerでは同じドメイン内しか飛べないので特に検証していない
    router.replace(url.value)
  }

  return { redirect }
}

export default useRedirectParam