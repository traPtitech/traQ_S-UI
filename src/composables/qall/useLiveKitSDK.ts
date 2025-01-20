import {
  Track,
  RoomEvent,
  AudioPresets,
  createLocalScreenTracks,
  Room
} from 'livekit-client'
import type {
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  LocalTrackPublication,
  LocalParticipant,
  Participant,
  TrackPublication,
  LocalTrack
} from 'livekit-client'
import { ref, type Ref } from 'vue'
import { useToastStore } from '/@/store/ui/toast'

const { addErrorToast } = useToastStore()

type TrackInfo = (
  | {
      isRemote: true
      trackPublication: RemoteTrackPublication
    }
  | {
      isRemote: false
      trackPublication: LocalTrackPublication | undefined
    }
) & {
  participantIdentity: string
}

const room = ref<Room>()
const speakerIdentity = ref<string[]>([])
const tracksMap: Ref<Map<string, TrackInfo>> = ref(new Map())

function handleTrackSubscribed(
  track: RemoteTrack,
  publication: RemoteTrackPublication,
  participant: RemoteParticipant
) {
  if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
    // attach it to a new HTMLVideoElement or HTMLAudioElement
    tracksMap.value.set(publication.trackSid, {
      isRemote: true,
      trackPublication: publication,
      participantIdentity: participant.identity
    })
  }
}

function handleTrackUnsubscribed(
  track: RemoteTrack,
  publication: RemoteTrackPublication,
  participant: RemoteParticipant
) {
  // remove tracks from all attached elements
  tracksMap.value.delete(publication.trackSid)
}

function handleLocalTrackUnpublished(
  publication: LocalTrackPublication,
  participant: LocalParticipant
) {
  // when local tracks are ended, update UI to remove them from rendering
  tracksMap.value.delete(publication.trackSid)
}

function handleLocalTrackPublished(
  publication: LocalTrackPublication,
  participant: LocalParticipant
) {
  // when local tracks are ended, update UI to remove them from rendering
  if (!publication.track || publication.track.kind === Track.Kind.Audio) return
  tracksMap.value.set(publication.trackSid, {
    isRemote: false,
    trackPublication: publication,
    participantIdentity: participant.identity
  })
}

function handleActiveSpeakerChange(speakers: Participant[]) {
  // show UI indicators when participant is speaking
  speakerIdentity.value = speakers.map(s => s.identity)
}

function handleDisconnect() {
  console.log('disconnected from room')
}

const joinRoom = async (roomName: string, userName: string) => {
  try {
    const res = await fetch(
      `https://easy-livekit-token-publisher.trap.show/token`
    )
    const json = await res.json()
    const token = json.token
    // pre-warm connection, this can be called as early as your page is loaded
    //room.prepareConnection("https://livekit-test.trap.show:39357", token);
    room.value = new Room()
    await room.value.prepareConnection(
      'wss://livekit.qall-dev.trapti.tech',
      token
    )
    console.log(token)

    // set up event listeners
    room.value
      .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
      .on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange)
      .on(RoomEvent.Disconnected, handleDisconnect)
      .on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished)
      .on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished)

    // connect to room
    await room.value.connect('ws://localhost:7880', token)
    console.log('connected to room', room.value.name)

    // publish local camera and mic tracks
    await room.value.localParticipant.setMicrophoneEnabled(
      true,
      {
        channelCount: 2,
        voiceIsolation: true,
        echoCancellation: true,
        noiseSuppression: true
      },
      {
        audioPreset: AudioPresets.musicHighQualityStereo,
        forceStereo: true,
        red: false,
        dtx: false
      }
    )
    await room.value.localParticipant.setScreenShareEnabled(true, {
      audio: true
    })
  } catch {
    addErrorToast('Qallの接続に失敗しました')
    await leaveRoom()
  }

  window.addEventListener('beforeunload', leaveRoom)
}

async function leaveRoom() {
  // Leave the room by calling 'disconnect' method over the Room object
  await room.value?.disconnect()

  // Empty all variables
  room.value = undefined
  tracksMap.value.clear()

  window.removeEventListener('beforeunload', leaveRoom)
}

const addScreenShareTrack = async () => {
  try {
    if (!room.value) {
      addErrorToast('ルームが存在しません')
      return
    }
    const localTrack = await createLocalScreenTracks({})
    localTrack.map(async t => {
      await room.value?.localParticipant.publishTrack(t)
    })
  } catch {
    addErrorToast('スクリーン共有に失敗しました')
  }
}

const setLocalTrackMute = async (track: LocalTrack, muted: boolean) => {
  if (muted) {
    await track.mute()
  } else {
    await track.unmute()
  }
}

const setTrackEnabled = (
  publication: RemoteTrackPublication,
  muted: boolean
) => {
  publication.setEnabled(!muted)
}

export const useLiveKitSDK = () => {
  return {
    joinRoom,
    leaveRoom,
    addScreenShareTrack,
    setTrackEnabled,
    setLocalTrackMute,
    tracksMap
  }
}
