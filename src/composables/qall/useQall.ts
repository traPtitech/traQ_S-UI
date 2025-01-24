import { ref } from 'vue'
import { useLiveKitSDK } from '/@/composables/qall/useLiveKitSDK'
import { useMeStore } from '/@/store/domain/me'
import { useToastStore } from '/@/store/ui/toast'
import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client'
import AutoReconnectWebSocket from '/@/lib/websocket/AutoReconnectWebSocket'

type RoomWithParticipants = {
  roomId: string
  participants: { identity: string; joinedAt: string }[]
}[]

const roomWithParticipants = ref<RoomWithParticipants>([])
const callingChannel = ref('')

const {
  joinRoom,
  leaveRoom,
  addScreenShareTrack,
  removeVideoTrack,
  addCameraTrack,
  setLocalTrackMute,
  publishData,
  tracksMap,
  screenShareTrackSidMap,
  qallMitt
} = useLiveKitSDK()
const { myId } = useMeStore()
const { addErrorToast } = useToastStore()

const ws = new AutoReconnectWebSocket(
  'wss://qall-microservice-for-livekit.trap.show/api/ws',
  undefined,
  {
    maxReconnectionDelay: 3000,
    minReconnectionDelay: 1000
  }
)
ws.connect()
ws.addEventListener('message', event => {
  try {
    const data: RoomWithParticipants = JSON.parse(event.detail as string)
    roomWithParticipants.value = data
    console.log(data)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[WebSocket] Failed to parse: ', e)
  }
})

fetch('https://qall-microservice-for-livekit.trap.show/api/rooms').then(res => {
  res
    .json()
    .then(data => {
      console.log(data)
      if (!data) return
      roomWithParticipants.value = data
    })
    .catch(e => {
      // eslint-disable-next-line no-console
      console.warn('Failed to parse: ', e)
    })
})

const setSpeakerMute = (track: LocalAudioTrack, muted: boolean) => {
  setLocalTrackMute(track, muted)
}

const setVideoMute = (track: LocalVideoTrack, muted: boolean) => {
  setLocalTrackMute(track, muted)
}

export const useQall = () => {
  const joinQall = (channelName: string) => {
    if (callingChannel.value) {
      leaveRoom()
    }
    if (!myId.value) {
      addErrorToast('接続に失敗しました')
      return
    }
    joinRoom(channelName, myId.value)

    callingChannel.value = channelName
  }
  const leaveQall = () => {
    leaveRoom()
    callingChannel.value = ''
  }
  return {
    callingChannel,
    roomWithParticipants,
    joinQall,
    leaveQall,
    addScreenShareTrack,
    addCameraTrack,
    removeVideoTrack,
    publishData,
    tracksMap,
    screenShareTrackSidMap,
    qallMitt
  }
}
