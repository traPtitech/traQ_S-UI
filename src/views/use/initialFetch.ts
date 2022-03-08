import store from '/@/vuex'
import { ref } from 'vue'
import useLoginCheck from './loginCheck'
import { useDomainRtcStore } from '/@/store/domain/rtc'
import { useMeStore } from '/@/store/domain/me'

const useInitialFetch_ = () => {
  const {
    fetchUnreadChannels,
    fetchSubscriptions,
    fetchViewStates,
    fetchStampHistory,
    fetchStaredChannels
  } = useMeStore()
  const { fetchRTCState } = useDomainRtcStore()
  return () => {
    // 初回fetch
    store.dispatch.entities.fetchUsers()
    store.dispatch.entities.fetchUserGroups()
    store.dispatch.entities.fetchChannels()
    store.dispatch.entities.fetchStamps()

    fetchUnreadChannels()
    fetchSubscriptions()
    fetchViewStates()

    fetchStampHistory()
    store.dispatch.entities.fetchStampPalettes()

    fetchStaredChannels()
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
