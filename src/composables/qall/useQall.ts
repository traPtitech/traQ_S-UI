import { ref } from 'vue'
import {
  useLiveKitSDK,
  type TrackInfo
} from '/@/composables/qall/useLiveKitSDK'
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
import apis from '/@/lib/apis'

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
  speakerIdentitys,
  isMicOn,
  qallMitt
} = useLiveKitSDK()
const { myId } = useMeStore()
const { addErrorToast } = useToastStore()
const { channelsMap, bothChannelsMapInitialFetchPromise } = useChannelsStore()
const { findUserByName, usersMap } = useUsersStore()
const { addQueue } = useTts()

const meStore = useMeStore()
const rtcSettings = useRtcSettings()

/**
 * 認証付きFetch
 * qallFetch(input, init) -> fetch(...) にBearerトークンやheadersを付与
 */
const BASE_URL = 'https://qall-microservice-for-livekit.trap.show/'

/**
 * この型を用意し、RequestInit.headers を string-based で管理できるようにする
 */
type QallFetchInit = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

const qallFetch = async (
  input: string | URL | Request,
  init: QallFetchInit = {}
): Promise<Response> => {
  // 1) URLを組み立て
  const url =
    typeof input === 'string' && !input.startsWith('http')
      ? new URL(input, BASE_URL).toString()
      : input

  // 2) 認証トークン取得
  const traQtoken = (await apis.getMyQRCode(true)).data

  // 3) ヘッダを構築
  //    → Record<string, string> を new Headers() に変換し、Content-Type を調整
  const finalHeaders = new Headers(init.headers)

  // 4) Bearer トークンを強制付与
  finalHeaders.set('Authorization', `Bearer ${traQtoken}`)

  // 5) Content-Type を自動 or 削除
  //   - ヘッダになければ application/json をセット
  //   - '' (空) なら削除してマルチパート送信を許可
  if (!finalHeaders.has('Content-Type')) {
    // Content-Type が指定されていないなら、デフォルト 'application/json'
    finalHeaders.set('Content-Type', 'application/json')
  } else {
    // 呼び出し側で '' (空文字) としている場合 → ヘッダを削除 (ブラウザが適切に設定する)
    if (finalHeaders.get('Content-Type') === '') {
      finalHeaders.delete('Content-Type')
    }
  }

  // 6) fetch 実行
  return await fetch(url, {
    ...init,
    headers: finalHeaders
  })
}

export type SoundboardItem = {
  soundId: string
  soundName: string
  stampId: string
  creatorId: string
}
/** サウンドボード一覧 */
type SoundboardListResponse = SoundboardItem[]

/**
 * GET /soundboard
 * サウンドボード一覧を取得する
 */
const getSoundboardList = async (): Promise<SoundboardListResponse> => {
  const res = await qallFetch('/api/soundboard', { method: 'GET' })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GET /soundboard failed: ${text}`)
  }
  return (await res.json()) as SoundboardListResponse
}

/**
 * POST /soundboard (multipart/form-data)
 * @param file アップロードする音声ファイル
 * @param soundName ユーザがつける音声の名前
 */
const postSoundboard = async (
  file: File,
  soundName: string,
  stampId: string
): Promise<{ soundId: string }> => {
  const formData = new FormData()
  formData.append('audio', file)
  formData.append('soundName', soundName)
  formData.append('stampId', stampId)

  // 「headers.Content-Type = ''」でヘッダを削除し、multipartを有効にする
  const res = await qallFetch('/api/soundboard', {
    method: 'POST',
    headers: {
      'Content-Type': '' // これで multipart boundary を自動設定
    },
    body: formData
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST /soundboard failed: ${text}`)
  }
  return await res.json()
}

/**
 * POST /soundboard/play
 * @param soundId 再生したい音声のID
 * @param roomName 対象ルームのUUID文字列
 */
const postSoundboardPlay = async (soundId: string, roomName: string) => {
  const body = { soundId, roomName }
  const res = await qallFetch('/api/soundboard/play', {
    method: 'POST',
    body: JSON.stringify(body)
    // headers: Content-Type は JSONでOK
    // 問題なくqallFetch内で 'application/json' が付与される
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST /soundboard/play failed: ${text}`)
  }
  // 正常時に IngressInfo(ingressId, url, streamKey)が返る想定
  return await res.json()
}

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
    qallFetch,
    tracksMap,
    screenShareTrackSidMap,
    screenShareTracks,
    qallMitt,
    getQallingState,
    getSoundboardList,
    postSoundboard,
    postSoundboardPlay,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    speakerIdentitys,
    selectedTrack
  }
}
