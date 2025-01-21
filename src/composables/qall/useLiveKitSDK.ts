import {
  Track,
  RoomEvent,
  AudioPresets,
  createLocalScreenTracks,
  Room,
  LocalVideoTrack
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
import { ref, type Ref } from 'vue'
import { useToastStore } from '/@/store/ui/toast'
import apis from '/@/lib/apis'
import { VirtualBackgroundProcessor } from '@shiguredo/virtual-background'

const virtualBackgroundAssetsPath =
  'https://cdn.jsdelivr.net/npm/@shiguredo/virtual-background@latest/dist'

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

type CameraProcessor = {
  processor: VirtualBackgroundProcessor
  track: MediaStreamVideoTrack
  backgroundImageSrc?: MediaStream
}

const room = ref<Room>()
const speakerIdentity = ref<string[]>([])
const tracksMap: Ref<Map<string, TrackInfo>> = ref(new Map())
const cameraProcessorMap: Ref<Map<string, CameraProcessor>> = ref(new Map())

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
    room.value = new Room({ dynacast: true, adaptiveStream: true })
    await room.value.prepareConnection(
      'wss://livekit.qall-dev.trapti.tech',
      token
    )

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

const addCameraTrack = async (
  videoInputDevice?: MediaDeviceInfo,
  isBlur?: boolean,
  backgroundImage?: File,
  HTMLDivElement?: HTMLDivElement | null
) => {
  try {
    if (!room.value) {
      addErrorToast('ルームが存在しません')
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: videoInputDevice?.deviceId }
    })
    const track = stream.getVideoTracks()[0]
    if (!track) {
      addErrorToast('映像が取得できませんでした')
      return
    }
    let backgroundImageSrc: MediaStream | undefined
    const processor = new VirtualBackgroundProcessor(
      virtualBackgroundAssetsPath
    )
    let options = {}
    if (backgroundImage) {
      const blob = new Blob([backgroundImage], { type: backgroundImage.type })

      if (backgroundImage.type.startsWith('image/')) {
        //画像のとき
        const imageBitmap = await createImageBitmap(blob)
        options = {
          backgroundImage: imageBitmap
        }
      } else {
        //動画のとき
        const videoElement = await new Promise<HTMLVideoElement>(resolve => {
          const video = document.createElement('video')
          video.addEventListener('loadedmetadata', () => {
            video.play()
            resolve(video)
          })
          video.src = URL.createObjectURL(blob)
          video.muted = true
          video.loop = true
        })
        const canvas = drawVideoToCanvas(videoElement)
        options = {
          backgroundImage: canvas
        }
      }
    } else {
      backgroundImageSrc = await navigator.mediaDevices.getDisplayMedia({
        video: true
      })
      const videoElement = await new Promise<HTMLVideoElement>(resolve => {
        const video = document.createElement('video')
        video.addEventListener('loadedmetadata', () => {
          video.play()
          resolve(video)
        })
        if (backgroundImageSrc) {
          video.srcObject = backgroundImageSrc
          video.autoplay = true
          video.muted = true
        }
      })

      const canvas = drawVideoToCanvas(videoElement)
      options = {
        backgroundImage: canvas
      }
    }
    const processedTrack = await processor.startProcessing(track, options)
    const localTrack = new LocalVideoTrack(processedTrack)
    await room.value?.localParticipant
      .publishTrack(localTrack, { simulcast: true })
      .catch(() => {
        addErrorToast('カメラの共有に失敗しました')
        track.stop()
        processor.stopProcessing()
        return
      })
    if (localTrack.sid) {
      cameraProcessorMap.value.set(localTrack.sid, {
        processor,
        track,
        backgroundImageSrc
      })
    }
  } catch (e) {
    addErrorToast('カメラの共有に失敗しました')
    return
  }
}

const drawVideoToCanvas = (video: HTMLVideoElement) => {
  const canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight)
  setInterval(() => {
    const canvasCtx = canvas.getContext('2d', {
      desynchronized: true,
      willReadFrequently: false // ここをtrueにするとCPU-GPUメモリ転送が発生して遅くなる
    })
    if (!canvasCtx) return
    canvasCtx.drawImage(video, 0, 0)
  }, 30)
  return canvas
}

const addScreenShareTrack = async () => {
  try {
    if (!room.value) {
      addErrorToast('ルームが存在しません')
      return
    }
    const localTracks = await createLocalScreenTracks({
      audio: {
        channelCount: 2,
        autoGainControl: false,
        noiseSuppression: false,
        echoCancellation: false,
        voiceIsolation: false
      }
    })

    await Promise.all(
      localTracks.map(async t => {
        if (t.kind === Track.Kind.Video) {
          await room.value?.localParticipant.publishTrack(t, {
            simulcast: true
          })
        } else {
          await room.value?.localParticipant.publishTrack(t, {
            audioPreset: AudioPresets.musicHighQualityStereo,
            dtx: false,
            red: false
          })
        }
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
    const cameraProcessor = cameraProcessorMap.value.get(
      localpublication.trackSid
    )
    if (cameraProcessor) {
      cameraProcessor.processor.stopProcessing()
      cameraProcessor.track.stop()
      cameraProcessor.backgroundImageSrc
        ?.getTracks()
        .forEach(track => track.stop())
      cameraProcessorMap.value.delete(localpublication.trackSid)
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
