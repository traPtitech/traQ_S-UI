import { ref } from 'vue'
import {
  useLiveKitSDK,
  type TrackInfo
} from '/@/composables/qall/useLiveKitSDK'
import { useMeStore } from '/@/store/domain/me'
import { useToastStore } from '/@/store/ui/toast'
import type { LocalAudioTrack } from 'livekit-client'
import { useUsersStore } from '/@/store/entities/users'
import { messageMitt } from '/@/store/entities/messages'
import { useTts } from '/@/store/app/tts'
import { useRtcSettings } from '/@/store/app/rtcSettings'
import { useRoomsStore } from '/@/store/domain/rooms'

const {
  joinRoom,
  leaveRoom,
  addScreenShareTrack,
  removeVideoTrack,
  addCameraTrack,
  setLocalTrackMute,
  publishData,
  toggleMicTrack,
  tracksMap,
  screenShareTrackSidMap,
  screenShareTracks,
  speakerIdentities,
  isMicOn,
  qallMitt
} = useLiveKitSDK()
const { myId } = useMeStore()
const { addErrorToast } = useToastStore()
const { usersMap } = useUsersStore()
const { addQueue } = useTts()

const meStore = useMeStore()
const rtcSettings = useRtcSettings()

const setSpeakerMute = (track: LocalAudioTrack, muted: boolean) => {
  setLocalTrackMute(track, muted)
}

messageMitt.on('addMessage', ({ message }) => {
  if (!rtcSettings.isTtsEnabled.value) return
  if (callingChannel.value !== message.channelId) return
  if (meStore.myId.value === message.userId) return

  const userDisplayName =
    usersMap.value.get(message.userId)?.displayName ?? 'はてな'
  addQueue({
    channelId: message.channelId,
    userDisplayName,
    text: message.content
  })
})
const callingChannel = ref('')
const isSubView = ref(false)
const getQallingState = (channelId: string) => {
  if (!callingChannel.value) return 'none'
  if (callingChannel.value === channelId && !isSubView.value) return 'mainView'
  return 'subView'
}

const isCameraOn = ref(false)
const isScreenSharing = ref(false)

const selectedTrack = ref<TrackInfo>()

export const useQall = () => {
  const { rooms } = useRoomsStore()

  let joiningPromise: Promise<void> | null = null
  const joinQall = async (channelName: string, isWebinar: boolean = false) => {
    // 二重実行を防ぐチェック
    if (joiningPromise) return

    const attemptJoin = async () => {
      try {
        if (callingChannel.value) {
          await leaveQall()
          return
        }
        if (!myId.value) {
          addErrorToast('接続に失敗しました')
          return
        }
        await joinRoom(channelName, isWebinar)
        callingChannel.value = channelName
      } catch {
        addErrorToast('Qallへの参加に失敗しました')
      } finally {
        joiningPromise = null
      }
    }

    joiningPromise = attemptJoin()
  }
  const leaveQall = async () => {
    callingChannel.value = ''
    await leaveRoom()
    isSubView.value = false
    selectedTrack.value = undefined
    isMicOn.value = true
    isCameraOn.value = false
    isScreenSharing.value = false
  }

  return {
    callingChannel,
    isSubView,
    rooms,
    joinQall,
    leaveQall,
    addScreenShareTrack,
    addCameraTrack,
    removeVideoTrack,
    publishData,
    setSpeakerMute,
    toggleMicMute: toggleMicTrack,
    tracksMap,
    screenShareTrackSidMap,
    screenShareTracks,
    qallMitt,
    getQallingState,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    speakerIdentities,
    selectedTrack
  }
}
