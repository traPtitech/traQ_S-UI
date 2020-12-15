import { defineMutations } from 'direct-vuex'
import { S, ChannelTree } from './state'

export const mutations = defineMutations<S>()({
  setChannelTree(state, payload: Readonly<ChannelTree>) {
    state.channelTree = payload
  },
  setHomeChannelTree(state, payload: Readonly<ChannelTree>) {
    state.homeChannelTree = payload
  }
})
