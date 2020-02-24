import { createMutations } from 'direct-vuex'
import { S } from './state'
import { ChannelId } from '@/types/entity-ids'

export const mutations = createMutations<S>()({
  setLoaded(state: S, loaded: boolean) {
    state.loaded = loaded
  },
  setComponentLoaded(state: S, componentLoaded: boolean) {
    state.componentLoaded = componentLoaded
  },
  setCurrentChannelId(state: S, currentChannelId: ChannelId) {
    state.currentChannelId = currentChannelId
  }
})
