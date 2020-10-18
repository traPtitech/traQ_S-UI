import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { mainView } from './mainView'
import { messageContextMenu } from './messageContextMenu'
import { stampPicker } from './stampPicker'
import { modal } from './modal'
import { fileInput } from './fileInput'
import { toast } from './toast'
import { settings } from './settings'

export const ui = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    mainView,
    stampPicker,
    messageContextMenu,
    modal,
    fileInput,
    toast,
    settings
  }
})
