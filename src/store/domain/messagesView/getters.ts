import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { moduleGetterContext } from '@/store'
import { messagesView } from './index'
import { UserId, MessageId } from '@/types/entity-ids'
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
    const { rootState, state } = getterContext(args)

    const myId = rootState.domain.me.detail?.id
    return state.currentViewers
      .filter(v => v.state === ChannelViewState.Editing && v.userId !== myId)
      .map(v => v.userId)
      .reverse()
  },
  isPinned(state): (id: MessageId) => boolean {
    return (id: MessageId) => {
      return state.pinnedMessages.some(v => v.message.id === id)
    }
  }
})
