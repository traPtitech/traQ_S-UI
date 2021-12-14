import { defineMutations } from 'direct-vuex'
import { markRaw } from 'vue'
import { S } from './state'
import { UserId } from '/@/types/entity-ids'
import AudioStreamMixer from '/@/lib/webrtc/AudioStreamMixer'

export const mutations = defineMutations<S>()({
  setMixer(state, mixer: AudioStreamMixer) {
    state.mixer = markRaw(mixer)
  },
  unsetMixer(state) {
    state.mixer = undefined
  },
  /**
   * 0～1の値
   */
  setMasterVolume(state, volume: number) {
    state.mixer?.setMasterVolume(volume)
  },
  /**
   * @param volume 0-1で指定するボリューム (0がミュート、1がAudioStreamMixer.maxGainに相当するゲイン)
   */
  setUserVolume(state, { userId, volume }: { userId: string; volume: number }) {
    state.mixer?.setStreamVolume(userId, volume)
  },
  setLocalStream(state, mediaStream: MediaStream) {
    state.localStream = mediaStream

    if (!state.mixer) {
      throw new Error('mixer should be initialized')
    }

    const source = state.mixer.context.createMediaStreamSource(mediaStream)
    const analyzer = state.mixer.createAnalyzerNode()
    source.connect(analyzer)

    state.localStreamNodes = { source, analyzer }
  },
  unsetLocalStream(state) {
    state.localStream?.getTracks().forEach(t => t.stop())
    state.localStreamNodes?.source.disconnect()
    state.localStreamNodes?.analyzer.disconnect()

    state.localStream = undefined
    state.localStreamNodes = undefined
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
  setTalkingStateUpdateId(state, id: number) {
    state.talkingStateUpdateId = id
  },
  updateTalkingUserState(state, diffState: ReadonlyMap<UserId, number>) {
    diffState.forEach((loudnessLevel, userId) => {
      state.talkingUsersState.set(userId, loudnessLevel)
    })
  }
})
