import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { moduleGetterContext } from '@/store'
import { messagesView } from './index'
import { UserId, MessageId } from '@/types/entity-ids'
import { ChannelViewState } from '@traptitech/traq'

const getterContext = (args: [any, any, any, any]) =>
  moduleGetterContext(args, messagesView)

export const getters = defineGetters<S>()({
  getCurrentViewersId(state): UserId[] {
    return state.currentViewers
      .filter(v => v.state === ChannelViewState.Monitoring)
      .map(v => v.userId)
      .reverse()
  },
  isPinned(state): (id: MessageId) => boolean {
    return (id: MessageId) => {
      return state.pinnedMessages.findIndex(v => v.message.id === id) > -1
    }
  }
})
