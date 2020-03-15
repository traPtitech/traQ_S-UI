import { defineMutations } from 'direct-vuex'
import { S, ChannelTree } from './state'

export const mutations = defineMutations<S>()({
  setChannelTree(state, payload: ChannelTree) {
    state.channelTree = payload
  },
  setHomeChannelTree(state, payload: ChannelTree) {
    state.homeChannelTree = payload
  }
})
