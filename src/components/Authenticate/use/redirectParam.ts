import { SetupContext, computed, reactive } from '@vue/composition-api'
import { getStringParam } from '@/lib/util/params'

export interface RedirectState {
  /**
   * リダイレクト先
   * 外部の場合はhttp～、内部の場合は/～
   */
  redirectUrl?: string
  /**
   * 内部へのリダイレクトかどうか
   */
  isInternal?: boolean
}

const useRedirectParam = (context: SetupContext) => {
  const state: RedirectState = reactive({
    redirectUrl: computed(() => {
      const redirect = getStringParam(context.root.$route.query.redirect)
      return redirect ? redirect : undefined
    }),
    isInternal: computed(() => state.redirectUrl?.startsWith('/') ?? false)
  })

  return state
}

export default useRedirectParam
