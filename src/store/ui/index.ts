import { createModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { messageContextMenu } from './messageContextMenu'
import { stampPicker } from './stampPicker'

export const ui = createModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    stampPicker,
    messageContextMenu
  }
})
