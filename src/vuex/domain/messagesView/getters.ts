import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { moduleGetterContext } from '/@/vuex'
import { messagesView } from './index'
import { UserId } from '/@/types/entity-ids'
import { ChannelViewState } from '@traptitech/traq'

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
    const { state, rootGetters } = getterContext(args)

    const myId = rootGetters.domain.me.myId
    return state.currentViewers
      .filter(v => v.state === ChannelViewState.Editing && v.userId !== myId)
      .map(v => v.userId)
      .reverse()
  }
})
