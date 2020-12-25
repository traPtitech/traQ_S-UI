import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { moduleGetterContext } from '@/store'
import { messagesView } from './index'
import { UserId } from '@/types/entity-ids'
import { ChannelViewState } from '@traptitech/traq'
import _store from '@/_store'

const getterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, messagesView)

export const getters = defineGetters<S>()({
  /**
   * チャンネルを見ている人(入力中も含む)のIDの一覧(古い順)
   */
  viewingUsers(state): UserId[] {
    return state.currentViewers
      .filter(
        v => v.state === ChannelViewState.Monitoring || ChannelViewState.Editing
      )
      .map(v => v.userId)
  },
  /**
   * チャンネルで入力中の人のIDの一覧(新しい順)
   */
  typingUsers(...args): UserId[] {
    const { state } = getterContext(args)

    const myId = _store.state.domain.me.detail?.id
    return state.currentViewers
      .filter(v => v.state === ChannelViewState.Editing && v.userId !== myId)
      .map(v => v.userId)
      .reverse()
  }
})
