import { ref, watch } from 'vue'

import { isAxiosError } from 'axios'
import type { LocalAudioTrack } from 'livekit-client'

import {
  type TrackInfo,
  useLiveKitSDK
} from '/@/composables/qall/useLiveKitSDK'
import { clearParticipantVolumes } from '/@/composables/qall/useQallVolume'
import apis from '/@/lib/apis'
import { useRtcSettings } from '/@/store/app/rtcSettings'
import { useTts } from '/@/store/app/tts'
import { useMeStore } from '/@/store/domain/me'
import { useRoomsStore } from '/@/store/domain/rooms'
import { messageMitt } from '/@/store/entities/messages'
import { useUsersStore } from '/@/store/entities/users'
import { useToastStore } from '/@/store/ui/toast'

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
  canPublish,
  isWebinar,
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

// 発言権限がなくなったら、カメラ・画面共有はサーバーに止められる
watch(canPublish, value => {
  if (value) return
  isCameraOn.value = false
  isScreenSharing.value = false
})

/**
 * ウェビナーで、ユーザーに発言権限 (= 管理権限) を付与・剥奪する
 */
const changeSpeakingPermission = async (
  userId: string,
  newCanPublish: boolean
) => {
  if (!callingChannel.value) return
  try {
    await apis.changeParticipantRole(callingChannel.value, [
      { users: [{ userId, canPublish: newCanPublish }] }
    ])
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[Qall] failed to change the speaking permission', e)
    const status = isAxiosError(e) ? e.response?.status : undefined
    if (status === 400 && !newCanPublish) {
      addErrorToast('発言権限を持つ人が1人もいなくなるため、外せません')
    } else {
      addErrorToast('発言権限の変更に失敗しました')
    }
  }
}

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
        if (!rtcSettings.isEnabled.value) {
          addErrorToast(
            'RTC機能が無効になっています。設定 > 通話 (Qall) から有効にしてください'
          )
          return
        }
        await joinRoom(channelName, isWebinar)
        callingChannel.value = channelName
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[Qall] failed to join', e)
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
    isMicOn.value = false
    isCameraOn.value = false
    isScreenSharing.value = false
    clearParticipantVolumes()
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
    canPublish,
    isWebinar,
    changeSpeakingPermission,
    isCameraOn,
    isScreenSharing,
    speakerIdentities,
    selectedTrack
  }
}
