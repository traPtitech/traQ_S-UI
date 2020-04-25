import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { WebRTCUserState, WebRTCUserStateSessions } from '@traptitech/traq'
import { reduceToRecord } from '@/lib/util/record'
import Vue from 'vue'
import { changeRTCState } from '@/lib/websocket/send'
import { ChannelId } from '@/types/entity-ids'

export const mutations = defineMutations<S>()({
  setRTCState(state, payload: WebRTCUserState[]) {
    state.userStateMap = reduceToRecord(payload, 'userId')
  },
  updateRTCState(state, payload: WebRTCUserState) {
    Vue.set(state.userStateMap, payload.userId, payload)
  },
  setLocalStream(state, mediaStream: MediaStream) {
    state.localStream = mediaStream
  },
  setCurrentRTCChannel(state, payload: ChannelId) {
    state.currentRTCChannel = payload
  },
  unsetCurrentRTCChannel(state) {
    state.currentRTCChannel = undefined
  },
  setCurrentRTCSessions(state, payload: WebRTCUserStateSessions[]) {
    state.currentRTCSessions = payload
  },
  addCurrentRTCSession(state, payload: WebRTCUserStateSessions) {
    if (!state.currentRTCChannel) {
      throw 'no rtc channel'
    }
    const index = state.currentRTCSessions.findIndex(
      session =>
        session.state === payload.state ||
        session.sessionId === payload.sessionId
    )
    if (index !== -1) {
      throw 'rtc session conflict'
    }
    state.currentRTCSessions.push(payload)
    changeRTCState(state.currentRTCChannel, state.currentRTCSessions)
  },
  removeCurrentRTCSessionsBySessionType(state, sessionType: string) {
    if (!state.currentRTCChannel) {
      throw 'no rtc channel'
    }
    const index = state.currentRTCSessions.findIndex(
      session => session.state === sessionType
    )
    if (index !== -1) {
      state.currentRTCSessions.splice(index, 1)
    }
    changeRTCState(state.currentRTCChannel, state.currentRTCSessions)
  }
})
