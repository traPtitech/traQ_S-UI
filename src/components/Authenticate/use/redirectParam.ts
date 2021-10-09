import { computed, reactive } from 'vue'
import { getFirstQuery } from '/@/lib/basic/url'
import { redirectToPipelineIfNeeded } from '/@/router/pipeline'
import router, { RouteName } from '/@/router'
import { useRoute } from 'vue-router'

export interface RedirectState {
  /**
   * リダイレクト先
   * 外部の場合はhttp～、内部の場合は/～
   */
  url?: string
  /**
   * 内部へのリダイレクトかどうか
   */
  isInternal?: boolean
}

const useRedirectParam = () => {
  const route = useRoute()

  const state: RedirectState = reactive({
    url: computed(() => getFirstQuery(route.query['redirect']) || ''),
    isInternal: computed(() => state.url?.startsWith('/') ?? false)
  })

  const redirect = () => {
    if (!state.url) {
      router.replace({ name: RouteName.Index })
      return
    }

    if (state.isInternal) {
      router.replace(state.url)
      return
    }

    // 外部へのredirパラメータがついてる場合は
    // pipelineへのリダイレクトをする
    // pipelineへのリダイレクトをしなくていい環境では
    // トップへリダイレクトする
    const redirected = redirectToPipelineIfNeeded()
    if (!redirected) {
      router.replace('/')
    }
  }

  return { redirect }
}

export default useRedirectParam
