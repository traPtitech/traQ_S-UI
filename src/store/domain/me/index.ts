import { defineDBModule } from '@/store/defineDBModule'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { wsListeners, messageListeners } from './listeners'
import { mitt } from '@/lib/typedMitt'

export const me = defineDBModule({
  path: ['domain.me.detail'],
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
wsListeners()
messageListeners()

type MeEventMap = {
  setSubscriptions: () => void
  updateSubscriptions: () => void
}

export const meMitt = mitt<MeEventMap>()
