import { onBeforeMount, onActivated } from 'vue'
import store from '@/store'
import router, { RouteName } from '@/router'
import { ws } from '@/lib/websocket'

const initialFetch = async () => {
  // 初回fetch
  await Promise.all([
    store.dispatch.entities.fetchChannels(),
    store.dispatch.domain.me.fetchUnreadChannels(),
    store.dispatch.entities.fetchUsers(),
    // チャンネルでのメッセージスタンプ表示時にずれてしまうので先に取得しておく
    // メッセージのレンダリングにも必要なので待つ必要がある
    store.dispatch.entities.fetchStamps()
  ])

  store.commit.app.setInitialFetchCompleted()

  store.dispatch.entities.fetchUserGroups()
  store.dispatch.domain.stampCategory.constructStampCategories()
  store.dispatch.entities.fetchStampPalettes()
  store.dispatch.entities.fetchClipFolders()
  store.dispatch.domain.fetchOnlineUsers()
  store.dispatch.domain.me.fetchStaredChannels()
  store.dispatch.domain.me.fetchStampHistory()
  store.dispatch.app.rtc.fetchRTCState()

  await store.dispatch.domain.me.fetchSubscriptions()
  store.dispatch.domain.channelTree.constructHomeChannelTree()
}

const initialFetchIfPossible = () =>
  new Promise(async (resolve, reject) => {
    try {
      await store.dispatch.domain.me.fetchMe()
    } catch {
      router.replace({
        name: RouteName.Login,
        query: { redirect: `${location.pathname}${location.search}` }
      })
      reject()
      return
    }

    resolve()

    initialFetch()

    ws.addEventListener('reconnect', () => {
      initialFetch()
    })
  })

/**
 * ログインチェック成功後にafterLoginCheckが呼び出される
 */
const useInitialFetch = (afterLoginCheck: () => void) => {
  const hook = async () => {
    if (store.state.app.initialFetchCompleted) return
    try {
      await initialFetchIfPossible()
      afterLoginCheck()
    } catch {}
  }

  onBeforeMount(hook)
  onActivated(hook)
}

export default useInitialFetch
