import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { moduleGetterContext } from '@/store'
import { messagesView } from './index'
import { UserId } from '@/types/entity-ids'
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
  typingUsers(...args): UserId[] {
    const { rootState, state } = getterContext(args)

    const myId = rootState.domain.me.detail?.id
    return state.currentViewers
      .filter(v => v.state === ChannelViewState.Editing && v.userId !== myId)
      .map(v => v.userId)
  }
})
