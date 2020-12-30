import router, { RouteName } from '@/router'
import store from '@/_store'
import { onActivated, onBeforeMount } from 'vue'

/**
 * ログイン状態かを確認し、ログインしていなかった場合はログイン画面へ遷移する
 */
export const performLoginCheck = async () => {
  try {
    await store.dispatch.domain.me.fetchMe()
  } catch {
    router.replace({
      name: RouteName.Login,
      query: { redirect: `${location.pathname}${location.search}` }
    })
    throw 'Login required'
  }
}

const useLoginCheck = (afterCheck?: () => void) => {
  const hook = async () => {
    if (!store.state.domain.me.detail) {
      try {
        await performLoginCheck()
      } catch {}
    }
    afterCheck?.()
  }
  onBeforeMount(hook)
  onActivated(hook)
}

export default useLoginCheck
