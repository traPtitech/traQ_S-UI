import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { mainView } from './mainView'
import { messageContextMenu } from './messageContextMenu'
import { stampPicker } from './stampPicker'

export const ui = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    mainView,
    stampPicker,
    messageContextMenu
  }
})
