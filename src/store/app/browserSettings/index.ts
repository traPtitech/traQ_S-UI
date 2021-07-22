import { defineDBModule } from '/@/store/defineDBModule'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { defineChannelTreeListeners } from './listeners'

export type SendKey = 'modifier' | 'none'
export interface SendKeys {
  /**
   * Windows: Alt, Mac: ⌥(Option)
   */
  alt: boolean
  /**
   * Windows: Ctrl, Mac: ⌘(Command)
   */
  ctrl: boolean
  /**
   * Windows: Shift, Mac: Shift
   */
  shift: boolean
  /**
   * Windows: なし, Mac: Ctrl
   */
  macCtrl: boolean
}
export type OpenMode = 'lastOpen' | 'particular'
export interface ActivityMode {
  all: boolean
  perChannel: boolean
}

export const browserSettings = defineDBModule({
  path: 'app.browserSettings',
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
defineChannelTreeListeners(store => store.app.browserSettings)
