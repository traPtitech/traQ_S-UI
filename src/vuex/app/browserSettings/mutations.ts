import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { overwrite } from '/@/lib/basic/object'

export const mutations = defineMutations<S>()({
  set(state, newState: Partial<S>) {
    overwrite(state, newState)
  },
  setActivityModeAll(state, all: boolean) {
    state.activityMode = { ...state.activityMode, all }
  },
  setActivityModePerChannel(state, perChannel: boolean) {
    state.activityMode = { ...state.activityMode, perChannel }
  },
  setLastOpenChannelName(state, channelName: string) {
    state.lastOpenChannelName = channelName
  },
  setOpenChannelName(state, channelName: string) {
    state.openChannelName = channelName
  },
  setFilterStarChannel(state, filter: boolean) {
    state.filterStarChannel = filter
  }
})
