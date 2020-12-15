import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

export interface Place {
  x: number
  y: number
}

export const stampPicker = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
