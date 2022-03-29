import { createSingleflight } from '/@/lib/basic/async'
import { isIOSApp } from '/@/lib/dom/browser'
import router, { RouteName } from '/@/router'
import { onActivated, onBeforeMount, ref } from 'vue'
import { useMeStore } from '/@/store/domain/me'
import { setupWebSocket } from '/@/lib/websocket'

/**
 * ログイン状態かを確認し、ログインしていなかった場合はログイン画面へ遷移する
 */
const performLoginCheck = createSingleflight(
  async (fetchMe: () => Promise<object | undefined>) => {
    const res = await fetchMe()
    if (!res) {
      router.replace({
        name: RouteName.Login,
        query: { redirect: `${location.pathname}${location.search}` }
      })
      throw 'Login required'
    }
  }
)

/**
 * @param afterCheck ログイン確認後、ログインしていたら実行される
 */
const useLoginCheck = (afterCheck?: () => void) => {
  const { detail, fetchMe } = useMeStore()
  const isLoginCheckDone = ref(false)

  const hook = async () => {
    // 不整合の防止のため常にリクエストを送る
    try {
      await performLoginCheck(fetchMe)
    } catch {}

    if (isIOSApp(window)) {
      await window.webkit.messageHandlers.setLoginStatusHandler.postMessage(
        detail.value !== undefined
      )
    }
    await setupWebSocket()

    if (detail.value !== undefined) {
      afterCheck?.()
    }

    isLoginCheckDone.value = true
  }
  onBeforeMount(hook)
  onActivated(hook)

  return { isLoginCheckDone }
}

export default useLoginCheck
