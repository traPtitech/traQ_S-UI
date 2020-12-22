import { defineModule } from 'direct-vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { entityListeners } from './listeners'
import { mitt } from '@/lib/typedMitt'
import { ChannelId } from '@/types/entity-ids'

export const channelTree = defineModule({
  namespaced: true,
  state,
  getters,
  mutations,
  actions
})
entityListeners()

type ChannelTreeEventMap = {
  created: (data: { id: ChannelId; path: string }) => void
  moved: (data: { newPath: string; oldPath: string }) => void
}

export const channelTreeMitt = mitt<ChannelTreeEventMap>()
