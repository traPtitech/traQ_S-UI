import { defineDBModule } from '@/store/defineDBModule'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

export interface SendKeys {
  alt: boolean
  ctrl: boolean
  shift: boolean
}
export type OpenMode = 'lastOpen' | 'particular'

export const browserSettings = defineDBModule({
  path: 'app.browserSettings',
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
