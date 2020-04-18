import { onBeforeMount } from '@vue/composition-api'
import store from '@/store'

const useInitialFetch = () => {
  onBeforeMount(async () => {
    try {
      await store.dispatch.domain.me.fetchMe()
    } catch {
      location.href = '/login'
    }
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
    store.dispatch.domain.fetchChannelActivity()
    store.dispatch.domain.fetchOnlineUsers()
    store.dispatch.domain.me.fetchUnreadChannels()
    store.dispatch.domain.me.fetchStaredChannels()
    store.dispatch.domain.me.fetchStampHistory()

    // TODO: 全チャンネルについて取得する必要はないので遅延で良い
    store.dispatch.domain.me.fetchSubscriptions()
  })
}

export default useInitialFetch
