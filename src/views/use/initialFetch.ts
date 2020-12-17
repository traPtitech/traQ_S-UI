import { onBeforeMount, onActivated } from 'vue'
import store from '@/store'
import _store from '@/_store'
import { ws } from '@/lib/websocket'
import { performLoginCheck } from './loginCheck'

// TODO: 各ルートで必要なものをとるように書き換える
// Settings.vueに来たら～
// Main.vueに来たら～
// みたいに

// Main以外(Settingsなど)からMainに飛んだ場合は二重にfetchが走るが、
// レアケースなので対応しない(基本的にMainから開くため)
const initialFetch = async () => {
  // 初回fetch
  await Promise.all([
    store.dispatch.entities.fetchUsers(),
    _store.dispatch.entities.fetchChannels(),
    _store.dispatch.domain.me.fetchUnreadChannels(),
    // チャンネルでのメッセージスタンプ表示時にずれてしまうので先に取得しておく
    // メッセージのレンダリングにも必要なので待つ必要がある
    _store.dispatch.entities.fetchStamps()
  ])

  _store.commit.app.setInitialFetchCompleted()

  _store.dispatch.entities.fetchUserGroups()
  _store.dispatch.domain.stampCategory.constructStampCategories()
  _store.dispatch.entities.fetchStampPalettes()
  _store.dispatch.entities.fetchClipFolders()
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
