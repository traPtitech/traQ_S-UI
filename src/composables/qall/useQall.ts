import { ref } from 'vue'
import {
  useLiveKitSDK,
  type TrackInfo
} from '/@/composables/qall/useLiveKitSDK'
import { useMeStore } from '/@/store/domain/me'
import { useToastStore } from '/@/store/ui/toast'
import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client'
import type {
  Channel,
  QallRoomStateChangedEventRoomStatesInner,
  User
} from '@traptitech/traq'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'
import { messageMitt } from '/@/store/entities/messages'
import { useTts } from '/@/store/app/tts'
import { useRtcSettings } from '/@/store/app/rtcSettings'
import { wsListener } from '/@/lib/websocket'
import useMittListener from '../utils/useMittListener'

type Participant = {
  user: User
  joinedAt: string
  canPublish: boolean
  attributes: { [key: string]: string }
}
type Room = {
  channel: Channel
  participants: Participant[]
  isWebinar: boolean
}
type Rooms = Room[]

const rooms = ref<Rooms>([])

useMittListener(
  wsListener,
  'QALL_ROOM_STATE_CHANGED',
  async ({ roomStates }) => {
    purifyRoomData(roomStates).then(
      purifiedRooms => (rooms.value = purifiedRooms)
    )
  }
)

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
const { channelsMap, bothChannelsMapInitialFetchPromise } = useChannelsStore()
const { usersMap } = useUsersStore()
const { addQueue } = useTts()

const meStore = useMeStore()
const rtcSettings = useRtcSettings()

const purifyRoomData = async (
  data: QallRoomStateChangedEventRoomStatesInner[]
): Promise<Rooms> => {
  if (!data) return []
  await bothChannelsMapInitialFetchPromise.value
  return data
    .filter(room => room.participants && room.participants.length > 0)
    .map(room => {
      return {
        channel: channelsMap.value.get(room.roomId),
        participants:
          room.participants
            ?.map(p => ({
              joinedAt: p.joinedAt,
              user: usersMap.value.get(p.identity.slice(0, -37)),
              canPublish: p.canPublish,
              attributes: p.attributes
            }))
            .filter((p): p is Participant => !!p.user) ?? [],
        isWebinar: room.isWebinar
      }
    })
    .filter((room): room is Room => {
      if (!room.channel) return false
      return !room.channel.archived
    })
}

const setSpeakerMute = (track: LocalAudioTrack, muted: boolean) => {
  setLocalTrackMute(track, muted)
}

const setVideoMute = (track: LocalVideoTrack, muted: boolean) => {
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
  const joinQall = (channelName: string, isWebinar: boolean = false) => {
    if (callingChannel.value) {
      leaveRoom()
    }
    if (!myId.value) {
      addErrorToast('接続に失敗しました')
      return
    }
    joinRoom(channelName, isWebinar)

    callingChannel.value = channelName
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
