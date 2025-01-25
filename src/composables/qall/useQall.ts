import { ref } from 'vue'
import { useLiveKitSDK } from '/@/composables/qall/useLiveKitSDK'
import { useMeStore } from '/@/store/domain/me'
import { useToastStore } from '/@/store/ui/toast'
import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client'
import AutoReconnectWebSocket from '/@/lib/websocket/AutoReconnectWebSocket'
import type { Channel, User } from '@traptitech/traq'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'
import { messageMitt } from '/@/store/entities/messages'
import { useTts } from '/@/store/app/tts'
import { useRtcSettings } from '/@/store/app/rtcSettings'

type RoomsWithParticipants =
  | {
      roomId: string
      participants:
        | {
            identity: string
            joinedAt: string
            name: string
            canPublish: boolean
            attributes: { [key: string]: string }
          }[]
        | null
      isWebinar: boolean
    }[]
  | null

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
const callingChannel = ref('')

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
  qallMitt
} = useLiveKitSDK()
const { myId } = useMeStore()
const { addErrorToast } = useToastStore()
const { channelsMap, bothChannelsMapInitialFetchPromise } = useChannelsStore()
const { findUserByName, usersMap } = useUsersStore()
const { addQueue } = useTts()

const meStore = useMeStore()
const rtcSettings = useRtcSettings()

const purifyRoomData = async (data: RoomsWithParticipants): Promise<Rooms> => {
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
              user: findUserByName(p.identity.slice(0, -37)),
              canPublish: p.canPublish ?? false,
              attributes: p.attributes ?? {}
            }))
            .filter((p): p is Participant => !!p.user) ?? [],
        isWebinar: room.isWebinar ?? false
      }
    })
    .filter((room): room is Room => {
      if (!room.channel) return false
      return !room.channel.archived
    })
}
const ws = new AutoReconnectWebSocket(
  'wss://qall-microservice-for-livekit.trap.show/api/ws',
  undefined,
  {
    maxReconnectionDelay: 3000,
    minReconnectionDelay: 1000
  }
)
ws.addEventListener('message', async event => {
  try {
    const data: RoomsWithParticipants = JSON.parse(event.detail as string)
    rooms.value = await purifyRoomData(data)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[WebSocket] Failed to parse: ', e)
  }
})
ws.connect()

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
  const leaveQall = () => {
    leaveRoom()
    callingChannel.value = ''
  }
  return {
    callingChannel,
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
    qallMitt
  }
}
