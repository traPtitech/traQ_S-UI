import store from '/@/vuex'
import { ref } from 'vue'
import useLoginCheck from './loginCheck'
import { useDomainRtcStore } from '/@/store/domain/rtc'

const useInitialFetch_ = () => {
  const { fetchRTCState } = useDomainRtcStore()
  return () => {
    // 初回fetch
    store.dispatch.entities.fetchUsers()
    store.dispatch.entities.fetchUserGroups()
    store.dispatch.entities.fetchChannels()
    store.dispatch.entities.fetchStamps()

    store.dispatch.domain.me.fetchUnreadChannels()
    store.dispatch.domain.me.fetchSubscriptions()
    store.dispatch.domain.me.fetchViewStates()

    store.dispatch.domain.me.fetchStampHistory()
    store.dispatch.entities.fetchStampPalettes()

    store.dispatch.domain.me.fetchStaredChannels()
    store.dispatch.entities.fetchClipFolders()
    fetchRTCState()
  }
}

const useInitialFetch = (afterLoginCheck: () => void) => {
  const initialFetch = useInitialFetch_()
  const initialFetchCompleted = ref(false)

  useLoginCheck(() => {
    if (initialFetchCompleted.value) return

    initialFetchCompleted.value = true
    initialFetch()
    afterLoginCheck()
  })
}

export default useInitialFetch
