import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { WebRTCUserState } from '@traptitech/traq'
import { reduceToRecord } from '@/lib/util/record'
import Vue from 'vue'

export const mutations = defineMutations<S>()({
  setRTCState(state, payload: WebRTCUserState[]) {
    state.userStateMap = reduceToRecord(payload, 'userId')
  },
  updateRTCState(state, payload: WebRTCUserState) {
    Vue.set(state.userStateMap, payload.userId, payload)
  }
})
