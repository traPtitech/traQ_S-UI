import { ref } from 'vue'
import { useLiveKitSDK } from '/@/composables/qall/useLiveKitSDK'
import { useMeStore } from '/@/store/domain/me'
import { useToastStore } from '/@/store/ui/toast'
import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client'

const isCalling = ref(false)
const {
  joinRoom,
  leaveRoom,
  addScreenShareTrack,
  removeVideoTrack,
  addCameraTrack,
  setLocalTrackMute,
  tracksMap
} = useLiveKitSDK()
const { myId } = useMeStore()
const { addErrorToast } = useToastStore()

const setSpeakerMute = (track: LocalAudioTrack, muted: boolean) => {
  setLocalTrackMute(track, muted)
}

const setVideoMute = (track: LocalVideoTrack, muted: boolean) => {
  setLocalTrackMute(track, muted)
}
export const useQall = () => {
  const toggleCalling = (channelName: string) => {
    if (isCalling.value) {
      leaveRoom()
    } else {
      if (!myId.value) {
        addErrorToast('接続に失敗しました')
        return
      }
      joinRoom('test', myId.value)
    }
    isCalling.value = !isCalling.value
  }
  return {
    isCalling,
    toggleCalling,
    addScreenShareTrack,
    addCameraTrack,
    removeVideoTrack,
    tracksMap
  }
}
