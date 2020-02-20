import { createModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { me } from './me'
import { rtc } from './rtc'
import { MessageId, UserId } from '@/types/entity-ids'

export interface ChannelState {
  messages: MessageId[]
  pinnedMessages: MessageId[]
  subscribedUser: UserId[]
  notifiedUser: UserId[]
}

export const domain = createModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    me,
    rtc
  }
})
