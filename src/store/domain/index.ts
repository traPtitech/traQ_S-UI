import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { me } from './me'
import { channelTree } from './channelTree'
import { messagesView } from './messagesView'
import { MessageId, UserId } from '@/types/entity-ids'

export interface ChannelState {
  messages: MessageId[]
  pinnedMessages: MessageId[]
  subscribedUser: UserId[]
  notifiedUser: UserId[]
}

export const domain = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    me,
    channelTree,
    messagesView
  }
})
