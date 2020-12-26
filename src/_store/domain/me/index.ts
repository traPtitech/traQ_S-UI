import { defineDBModule } from '@/_store/defineDBModule'
import { state } from './state'
import { mutations } from './mutations'
import { actions } from './actions'

export const me = defineDBModule({
  path: ['domain.me.detail'],
  namespaced: true,
  state,
  mutations,
  actions
})
