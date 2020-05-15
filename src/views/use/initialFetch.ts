import { onBeforeMount, SetupContext } from '@vue/composition-api'
import store from '@/store'
import { RouteName } from '@/router'
import { ws } from '@/lib/websocket'

const initialFetch = async () => {
  // 初回fetch
  await Promise.all([
    store.dispatch.entities.fetchUsers(),
    store.dispatch.entities.fetchUserGroups(),
    store.dispatch.entities.fetchChannels(),
    store.dispatch.entities.fetchStamps(),
    store.dispatch.domain.me.fetchUnreadChannels()
  ])

  store.commit.app.setInitialFetchCompleted()

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

/**
 * ログインチェック後にpromiseがsettledになる
 */
const useInitialFetch = (context: SetupContext) => {
  return new Promise((resolve, reject) => {
    onBeforeMount(async () => {
      try {
        await store.dispatch.domain.me.fetchMe()
      } catch {
        context.root.$router.replace({
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
  })
}

export default useInitialFetch
