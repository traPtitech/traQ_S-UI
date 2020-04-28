import { onBeforeMount, SetupContext } from '@vue/composition-api'
import store from '@/store'
import { RouteName } from '@/router'

/**
 * ログインチェック後にpromiseがsettledになる
 */
const useInitialFetch = (context: SetupContext) => {
  return new Promise((resolve, reject) => {
    onBeforeMount(async () => {
      try {
        await store.dispatch.domain.me.fetchMe()
      } catch {
        context.root.$router.replace({ name: RouteName.Login })
        reject()
        return
      }

      resolve()

      // 初回fetch
      await Promise.all([
        store.dispatch.entities.fetchUsers(),
        store.dispatch.entities.fetchUserGroups(),
        store.dispatch.entities.fetchChannels(),
        store.dispatch.entities.fetchStamps()
      ])

      store.commit.app.setInitialFetchCompleted()
      store.dispatch.domain.stampCategory.constructStampCategories()
      store.dispatch.entities.fetchStampPalettes()
      store.dispatch.entities.fetchClipFolders()
      store.dispatch.domain.fetchChannelActivity()
      store.dispatch.domain.fetchOnlineUsers()
      store.dispatch.domain.me.fetchUnreadChannels()
      store.dispatch.domain.me.fetchStaredChannels()
      store.dispatch.domain.me.fetchStampHistory()
      store.dispatch.app.rtc.fetchRTCState()

      await store.dispatch.domain.me.fetchSubscriptions()
      store.dispatch.domain.channelTree.constructHomeChannelTree()
    })
  })
}

export default useInitialFetch
