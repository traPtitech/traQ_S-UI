import { defineMutations } from 'direct-vuex'
import { markRaw } from 'vue'
import { S } from './state'
import { UserId } from '/@/types/entity-ids'
import AudioStreamMixer from '/@/lib/webrtc/AudioStreamMixer'
import ExtendedAudioContext from '/@/lib/webrtc/ExtendedAudioContext'
import LocalStreamManager from '/@/lib/webrtc/LocalStreamManager'

export const mutations = defineMutations<S>()({
  setContext(
    state,
    {
      audioContext,
      mixer,
      localStreamManager
    }: {
      audioContext: ExtendedAudioContext
      mixer: AudioStreamMixer
      localStreamManager: LocalStreamManager
    }
  ) {
    state.audioContext = markRaw(audioContext)
    state.mixer = markRaw(mixer)
    state.localStreamManager = markRaw(localStreamManager)
  },
  unsetContext(state) {
    state.audioContext = undefined
    state.mixer = undefined
    state.localStreamManager = undefined
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
  muteLocalStream(state) {
    if (!state.localStreamManager) return
    state.localStreamManager.mute()
    state.isMicMuted = true
  },
  unmuteLocalStream(state) {
    if (!state.localStreamManager) return
    state.localStreamManager.unmute()
    state.isMicMuted = false
  },
  setTalkingStateUpdateId(state, id: number) {
    state.talkingStateUpdateId = id
  },
  updateTalkingUserState(state, diffState: ReadonlyMap<UserId, number>) {
    diffState.forEach((loudnessLevel, userId) => {
      state.talkingUsersState.set(userId, loudnessLevel)
    })
  },
  setClosePromise(state, promise: Promise<void>) {
    state.closePromise = promise
  }
})
