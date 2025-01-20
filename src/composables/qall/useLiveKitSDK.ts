import {
  Track,
  RoomEvent,
  AudioPresets,
  createLocalScreenTracks,
  Room,
  createLocalVideoTrack
} from 'livekit-client'
import type {
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  LocalTrackPublication,
  LocalParticipant,
  Participant,
  LocalTrack
} from 'livekit-client'
import { ref, watch, type Ref } from 'vue'
import { useToastStore } from '/@/store/ui/toast'
import apis from '/@/lib/apis'

const { addErrorToast } = useToastStore()

export type TrackInfo = (
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
  if (!publication.track) return
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
    const traQtoken = (await apis.getMyQRCode(true)).data
    console.log(traQtoken)
    const res = await fetch(
      `https://easy-livekit-token-publisher.trap.show/token`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${traQtoken}`,
          'Content-Type': 'application/json'
        }
      }
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
    await room.value.connect('wss://livekit.qall-dev.trapti.tech', token)
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
    await room.value.localParticipant.setAttributes({})
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

const Attributes = ref<{ [key: string]: string }>({})

const addCameraTrack = async (videoInputDevice?: MediaDeviceInfo) => {
  try {
    if (!room.value) {
      addErrorToast('ルームが存在しません')
      return
    }
    const localTrack = await createLocalVideoTrack({
      deviceId: videoInputDevice?.deviceId
    })
    room.value?.localParticipant.publishTrack(localTrack)
  } catch {
    addErrorToast('カメラの共有に失敗しました')
    return
  }
}

const addScreenShareTrack = async () => {
  try {
    if (!room.value) {
      addErrorToast('ルームが存在しません')
      return
    }
    const localTracks = await createLocalScreenTracks({
      audio: true
    })

    await Promise.all(
      localTracks.map(async t => {
        await room.value?.localParticipant.publishTrack(t)
      })
    )
    const videoSid = localTracks.find(t => t.kind === Track.Kind.Video)?.sid
    const audioSid = localTracks.find(t => t.kind === Track.Kind.Audio)?.sid
    if (audioSid && videoSid) {
      Attributes.value = {
        ...Attributes.value,
        [videoSid]: audioSid
      }
      await room.value.localParticipant.setAttributes({
        ...room.value.localParticipant.attributes,
        [videoSid]: audioSid
      })
    }
  } catch {
    addErrorToast('スクリーン共有に失敗しました')
  }
}

const removeVideoTrack = async (localpublication: LocalTrackPublication) => {
  if (localpublication.track) {
    if (!room.value) {
      addErrorToast('ルームが存在しません')
      return
    }

    const { [localpublication.trackSid]: audioSid, ...newAttributes } =
      Attributes.value
    //room.value.localParticipant.attributes
    await room.value.localParticipant.unpublishTrack(
      localpublication.track,
      true
    )
    room.value.localParticipant.setAttributes(newAttributes)
    Attributes.value = newAttributes
    if (!audioSid) {
      return
    }

    const audioTrack = tracksMap.value.get(audioSid)
    console.log(audioTrack)
    console.log(tracksMap.value)
    if (
      !audioTrack ||
      audioTrack.isRemote ||
      !audioTrack.trackPublication?.track
    ) {
      return
    }

    await room.value.localParticipant.unpublishTrack(
      audioTrack.trackPublication.track,
      true
    )
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
    addCameraTrack,
    removeVideoTrack,
    setTrackEnabled,
    setLocalTrackMute,
    tracksMap
  }
}
