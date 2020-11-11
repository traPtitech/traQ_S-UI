import router, { RouteName } from '@/router'
import store from '@/store'
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
  store.commit.app.setLoginCheckSucceeded()
}

const useLoginCheck = (afterCheck?: () => void) => {
  const hook = async () => {
    if (!store.state.app.loginCheckSucceeded) {
      try {
        await performLoginCheck()
      } catch {}
    }
    if (afterCheck) {
      afterCheck()
    }
  }
  onBeforeMount(hook)
  onActivated(hook)
}

export default useLoginCheck
