import store from '@/store'
import _store from '@/_store'
import { ref } from 'vue'
import useLoginCheck from './loginCheck'

// TODO: 各ルートで必要なものをとるように書き換える
// Settings.vueに来たら～
// Main.vueに来たら～
// みたいに

const initialFetch = async () => {
  // 初回fetch
  store.dispatch.entities.fetchUsers()
  store.dispatch.entities.fetchChannels()
  store.dispatch.entities.fetchStamps()
  store.dispatch.domain.me.fetchUnreadChannels()

  store.dispatch.entities.fetchUserGroups()
  store.dispatch.entities.fetchStampPalettes()
  store.dispatch.entities.fetchClipFolders()
  store.dispatch.domain.me.fetchStaredChannels()
  store.dispatch.domain.me.fetchStampHistory()
  store.dispatch.domain.rtc.fetchRTCState()

  store.dispatch.domain.me.fetchSubscriptions()
}

const useInitialFetch = (afterLoginCheck: () => void) => {
  const initialFetchCompleted = ref(false)

  useLoginCheck(() => {
    if (!_store.getters.domain.me.isLoggedIn) return
    if (initialFetchCompleted.value) return

    initialFetchCompleted.value = true
    initialFetch()
    afterLoginCheck()
  })
}

export default useInitialFetch
