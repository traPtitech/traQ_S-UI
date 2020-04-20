import { onBeforeMount, SetupContext } from '@vue/composition-api'
import store from '@/store'
import { RouteName } from '@/router'

const useInitialFetch = (context: SetupContext) => {
  onBeforeMount(async () => {
    try {
      await store.dispatch.domain.me.fetchMe()
    } catch {
      context.root.$router.replace({ name: RouteName.Login })
      return
    }
    // 初回fetch
    await Promise.all([
      store.dispatch.entities.fetchUsers(),
      store.dispatch.entities.fetchUserGroups(),
      // fetchChannels後のsetChannelsで呼び出されるcontructAllTreesでsubscriptionsが必要となる
      store.dispatch.domain.me
        .fetchSubscriptions()
        .then(() => store.dispatch.entities.fetchChannels()),
      store.dispatch.entities.fetchStamps()
    ])

    store.commit.app.setInitialFetchCompleted()
    store.dispatch.domain.stampCategory.constructStampCategories()
    store.dispatch.entities.fetchStampPalettes()
    store.dispatch.domain.fetchChannelActivity()
    store.dispatch.domain.fetchOnlineUsers()
    store.dispatch.domain.me.fetchUnreadChannels()
    store.dispatch.domain.me.fetchStaredChannels()
    store.dispatch.domain.me.fetchStampHistory()
  })
}

export default useInitialFetch
