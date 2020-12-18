import { defineModule } from 'direct-vuex'
import { MessageId, UserId } from '@/types/entity-ids'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { me } from './me'
import { channelTree } from './channelTree'
import { messagesView } from './messagesView'
import { stampCategory } from './stampCategory'

export interface ChannelState {
  messages: MessageId[]
  pinnedMessages: MessageId[]
  subscribedUser: UserId[]
  notifiedUser: UserId[]
}

export const ACTIVITY_LENGTH = 50

export const domain = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    me,
    channelTree,
    messagesView,
    stampCategory
  }
})
