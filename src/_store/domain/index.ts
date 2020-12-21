import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { me } from './me'
import { channelTree } from './channelTree'
import { messagesView } from './messagesView'
import { stampCategory } from './stampCategory'

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
