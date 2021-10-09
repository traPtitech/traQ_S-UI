import { createSingleflight } from '/@/lib/util/async'
import { isIOSApp } from '/@/lib/util/browser'
import router, { RouteName } from '/@/router'
import store from '/@/store'
import { onActivated, onBeforeMount, ref } from 'vue'

/**
 * ログイン状態かを確認し、ログインしていなかった場合はログイン画面へ遷移する
 */
const performLoginCheck = createSingleflight(async () => {
  const res = await store.dispatch.domain.me.fetchMe()
  if (!res) {
    router.replace({
      name: RouteName.Login,
      query: { redirect: `${location.pathname}${location.search}` }
    })
    throw 'Login required'
  }
})

/**
 * @param afterCheck ログイン確認後、ログインしていたら実行される
 */
const useLoginCheck = (afterCheck?: () => void) => {
  const isLoginCheckDone = ref(false)

  const hook = async () => {
    // 不整合の防止のため常にリクエストを送る
    try {
      await performLoginCheck()
    } catch {}
    if (store.state.domain.me.detail !== undefined) {
      afterCheck?.()
    }

    if (isIOSApp(window)) {
      await window.webkit.messageHandlers.setLoginStatusHandler.postMessage(
        store.state.domain.me.detail !== undefined
      )
    }

    isLoginCheckDone.value = true
  }
  onBeforeMount(hook)
  onActivated(hook)

  return { isLoginCheckDone }
}

export default useLoginCheck
