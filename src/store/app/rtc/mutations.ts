import { defineMutations } from 'direct-vuex'
import { shallowReactive } from 'vue'
import { S } from './state'
import { UserId } from '/@/types/entity-ids'
import LegacyAudioStreamMixer from '/@/lib/legacyAudioStreamMixer'

export const mutations = defineMutations<S>()({
  setMixer(state, mixer: LegacyAudioStreamMixer) {
    state.mixer = shallowReactive(mixer)
  },
  unsetMixer(state) {
    state.mixer = undefined
  },
  /**
   * 0～1の値
   */
  setMasterVolume(state, volume: number) {
    if (state.mixer) {
      state.mixer.volume = volume
    }
  },
  setLocalStream(state, mediaStream: MediaStream) {
    state.localStream = mediaStream
    state.localAnalyzerNode = state.mixer?.createAnalyzer(mediaStream)
  },
  unsetLocalStream(state) {
    if (state.localStream) {
      state.localStream.getTracks().forEach(t => t.stop())
    }
    state.localStream = undefined
    state.localAnalyzerNode = undefined
  },
  muteLocalStream(state) {
    if (!state.localStream) return
    state.localStream.getAudioTracks().forEach(track => {
      track.enabled = false
    })
    state.isMicMuted = true
  },
  unmuteLocalStream(state) {
    if (!state.localStream) return
    state.localStream.getAudioTracks().forEach(track => {
      track.enabled = true
    })
    state.isMicMuted = false
  },
  addRemoteStream(
    state,
    payload: { userId: UserId; mediaStream: MediaStream }
  ) {
    state.remoteAudioStreamMap.set(payload.userId, payload.mediaStream)
  },
  removeRemoteStream(state, userId: UserId) {
    state.remoteAudioStreamMap
      .get(userId)
      ?.getTracks()
      .forEach(t => t.stop())
    state.remoteAudioStreamMap.delete(userId)
  },
  clearRemoteStream(state) {
    state.remoteAudioStreamMap.forEach(stream =>
      stream?.getTracks().forEach(t => t.stop())
    )
    state.remoteAudioStreamMap.clear()
  },
  /**
   * @param volume 0-1で指定するボリューム (0がミュート、1がAudioStreamMixer.maxGainに相当するゲイン)
   */
  setUserVolume(state, { userId, volume }: { userId: string; volume: number }) {
    state.userVolumeMap.set(userId, volume)
    if (state.mixer) {
      state.mixer.setAndSaveVolumeOf(userId, volume)
    }
  },
  setTalkingStateUpdateId(state, id: number) {
    state.talkingStateUpdateId = id
  },
  updateTalkingUserState(state, diffState: ReadonlyMap<UserId, number>) {
    diffState.forEach((loudnessLevel, userId) => {
      state.talkingUsersState.set(userId, loudnessLevel)
    })
  }
})
