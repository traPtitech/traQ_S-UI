import { onBeforeMount, onActivated } from 'vue'
import store from '@/store'
import _store from '@/_store'
import { ws } from '@/lib/websocket'
import { performLoginCheck } from './loginCheck'

// TODO: 各ルートで必要なものをとるように書き換える
// Settings.vueに来たら～
// Main.vueに来たら～
// みたいに

const initialFetch = async () => {
  // 初回fetch
  store.dispatch.entities.fetchUsers()
  store.dispatch.entities.fetchChannels()
  store.dispatch.entities.fetchStamps()
  // 未読処理前に未読を取得していないと未読を消せないため
  await _store.dispatch.domain.me.fetchUnreadChannels()

  _store.commit.app.setInitialFetchCompleted()

  store.dispatch.entities.fetchUserGroups()
  store.dispatch.entities.fetchStampPalettes()
  store.dispatch.entities.fetchClipFolders()
  _store.dispatch.domain.fetchOnlineUsers()
  _store.dispatch.domain.me.fetchStaredChannels()
  _store.dispatch.domain.me.fetchStampHistory()
  _store.dispatch.app.rtc.fetchRTCState()

  await _store.dispatch.domain.me.fetchSubscriptions()
  _store.dispatch.domain.channelTree.constructHomeChannelTree()
}

const initialFetchIfPossible = async () => {
  await performLoginCheck()
  initialFetch()

  ws.addEventListener('reconnect', () => {
    initialFetch()
  })
}

/**
 * ログインチェック成功後にafterLoginCheckが呼び出される
 */
const useInitialFetch = (afterLoginCheck: () => void) => {
  const hook = async () => {
    if (_store.state.app.initialFetchCompleted) return
    try {
      await initialFetchIfPossible()
      afterLoginCheck()
    } catch {}
  }

  onBeforeMount(hook)
  onActivated(hook)
}

export default useInitialFetch
