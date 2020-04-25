import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { WebRTCUserState, WebRTCUserStateSessions } from '@traptitech/traq'
import { reduceToRecord } from '@/lib/util/record'
import Vue from 'vue'
import { changeRTCState } from '@/lib/websocket/send'
import { ChannelId, UserId } from '@/types/entity-ids'
import AudioStreamMixer from '@/lib/audioStreamMixer'

export const mutations = defineMutations<S>()({
  setRTCState(state, payload: WebRTCUserState[]) {
    state.userStateMap = reduceToRecord(payload, 'userId')
  },
  updateRTCState(state, payload: WebRTCUserState) {
    Vue.set(state.userStateMap, payload.userId, payload)
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
  modifyCurrentRTCSessionBySessionType(
    state,
    payload: { sessionType: string; sessionState: string }
  ) {
    if (!state.currentRTCChannel) {
      throw 'no rtc channel'
    }
    const index = state.currentRTCSessions.findIndex(session =>
      session.state.startsWith(payload.sessionType)
    )
    if (index !== -1) {
      state.currentRTCSessions[index].state = payload.sessionState
    }
    changeRTCState(state.currentRTCChannel, state.currentRTCSessions)
  },
  removeCurrentRTCSessionBySessionType(state, sessionType: string) {
    if (!state.currentRTCChannel) {
      throw 'no rtc channel'
    }
    const index = state.currentRTCSessions.findIndex(session =>
      session.state.startsWith(sessionType)
    )
    if (index !== -1) {
      state.currentRTCSessions.splice(index, 1)
    }
    changeRTCState(state.currentRTCChannel, state.currentRTCSessions)
  },
  setMixer(state, mixer: AudioStreamMixer) {
    state.mixer = mixer
  },
  unsetMixer(state) {
    state.mixer = undefined
  },
  setLocalStream(state, mediaStream: MediaStream) {
    state.localStream = mediaStream
  },
  unsetLocalStream(state) {
    if (state.localStream) {
      state.localStream.getTracks().forEach(t => t.stop())
    }
    state.localStream = undefined
  },
  muteLocalStream(state) {
    if (!state.localStream) return
    ;(state.localStream as any).userMuted = true
    state.localStream.getAudioTracks().forEach(track => {
      track.enabled = false
    })
  },
  unmuteLocalStream(state) {
    if (!state.localStream) return
    ;(state.localStream as any).userMuted = true
    state.localStream.getAudioTracks().forEach(track => {
      track.enabled = true
    })
  },
  addRemoteStream(
    state,
    payload: { userId: UserId; mediaStream: MediaStream }
  ) {
    Vue.set(state.remoteAudioStreamMap, payload.userId, payload.mediaStream)
  },
  removeRemoteStream(state, userId: UserId) {
    state.remoteAudioStreamMap[userId]?.getTracks().forEach(t => t.stop())
    Vue.delete(state.remoteAudioStreamMap, userId)
  },
  clearRemoteStream(state) {
    Object.values(state.remoteAudioStreamMap).forEach(stream =>
      stream?.getTracks().forEach(t => t.stop())
    )
    state.remoteAudioStreamMap = {}
  },
  /**
   * @param volume 0-1で指定するボリューム (0がミュート、1がAudioStreamMixer.maxGainに相当するゲイン)
   */
  setUserVolume(state, { userId, volume }: { userId: string; volume: number }) {
    Vue.set(state.userVolumeMap, userId, volume)
    if (state.mixer) {
      state.mixer.setVolumeOf(userId, volume)
    }
  }
})
