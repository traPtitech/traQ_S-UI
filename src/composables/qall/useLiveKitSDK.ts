import { type Ref, computed, ref, watch } from 'vue'

import {
  NoiseGateWorkletNode,
  RnnoiseWorkletNode,
  SpeexWorkletNode,
  loadRnnoise as loadRnnoiseLib,
  loadSpeex as loadSpeexLib
} from '@sapphi-red/web-noise-suppressor'
import noiseGateWorkletPath from '@sapphi-red/web-noise-suppressor/noiseGateWorklet.js?url'
import rnnoiseWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise.wasm?url'
import rnnoiseWorkletPath from '@sapphi-red/web-noise-suppressor/rnnoiseWorklet.js?url'
import rnnoiseSimdWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise_simd.wasm?url'
import speexWasmPath from '@sapphi-red/web-noise-suppressor/speex.wasm?url'
import speexWorkletPath from '@sapphi-red/web-noise-suppressor/speexWorklet.js?url'
import { VirtualBackgroundProcessor } from '@shiguredo/virtual-background'
import type {
  LocalParticipant,
  LocalTrack,
  LocalTrackPublication,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication
} from 'livekit-client'
import {
  AudioPresets,
  LocalAudioTrack,
  LocalVideoTrack,
  Room,
  RoomEvent,
  Track,
  createLocalScreenTracks
} from 'livekit-client'
import mitt from 'mitt'

import apis from '/@/lib/apis'
import {
  isSoundboardIdentity,
  setAudioContextSinkId,
  userIdFromIdentity
} from '/@/lib/qall/audio'
import { configureLiveKitLogger } from '/@/lib/qall/livekitLogger'
import AudioStreamMixer from '/@/lib/webrtc/AudioStreamMixer'
import ExtendedAudioContext from '/@/lib/webrtc/ExtendedAudioContext'
import { useRtcSettings } from '/@/store/app/rtcSettings'
import { useToastStore } from '/@/store/ui/toast'

let speexWasmBinary: ArrayBuffer | undefined
const loadSpeexWasmBinary = async () => {
  if (speexWasmBinary) return speexWasmBinary
  speexWasmBinary = await loadSpeexLib({ url: speexWasmPath })
  return speexWasmBinary
}

let rnnoiseWasmBinary: ArrayBuffer | undefined
const loadRnnoiseWasmBinary = async () => {
  if (rnnoiseWasmBinary) return rnnoiseWasmBinary
  rnnoiseWasmBinary = await loadRnnoiseLib({
    url: rnnoiseWasmPath,
    simdUrl: rnnoiseSimdWasmPath
  })
  return rnnoiseWasmBinary
}

const virtualBackgroundAssetsPath =
  'https://cdn.jsdelivr.net/npm/@shiguredo/virtual-background@latest/dist'
type QallEventMap = {
  pushStamp: string
}
const { addErrorToast, addInfoToast } = useToastStore()
const qallMitt = mitt<QallEventMap>()
const rtcSettings = useRtcSettings()

configureLiveKitLogger()

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
  /**
   * ユーザーID
   */
  userName: string
  /**
   * LiveKit の参加者の Identity (同じユーザーでも端末ごとに異なる)
   */
  identity: string
}

type CameraProcessor = {
  processor: VirtualBackgroundProcessor
  track: MediaStreamVideoTrack
  backgroundImageSrc?: MediaStream
}

const room = ref<Room>()
const audioContext = ref<AudioContext>()
const speakerIdentities = ref<{ identity: string; name?: string }[]>([])
const tracksMap: Ref<Map<string, TrackInfo>> = ref(new Map())
const cameraProcessorMap: Ref<Map<string, CameraProcessor>> = ref(new Map())
const screenShareTrackSidMap = ref<Map<string, string>>(new Map())
const mixer = ref<AudioStreamMixer>()
const mixerAudioContext = ref<ExtendedAudioContext>()
const audioTrackId = ref<string>()

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
      userName: userIdFromIdentity(participant.identity),
      identity: participant.identity
    })
  }
}

function handleTrackUnsubscribed(
  _track: RemoteTrack,
  publication: RemoteTrackPublication,
  _participant: RemoteParticipant
) {
  // remove tracks from all attached elements
  tracksMap.value.delete(publication.trackSid)
  screenShareTrackSidMap.value.delete(publication.trackSid)
}

function handleLocalTrackUnpublished(
  publication: LocalTrackPublication,
  _participant: LocalParticipant
) {
  // when local tracks are ended, update UI to remove them from rendering
  tracksMap.value.delete(publication.trackSid)
  screenShareTrackSidMap.value.delete(publication.trackSid)
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
    userName: userIdFromIdentity(participant.identity),
    identity: participant.identity
  })
}

function handleActiveSpeakerChange(speakers: Participant[]) {
  // show UI indicators when participant is speaking
  speakerIdentities.value = speakers
}

function handleDisconnect() {
  //
}

function handleDataReceived(payload: Uint8Array<ArrayBufferLike>) {
  const data = JSON.parse(decoder.decode(payload))
  if (!data.type || !data.message) return
  if (data.type === 'stamp') {
    qallMitt.emit('pushStamp', data.message)
  }
}

function handleParticipantAttributesChanged(
  changed: Record<string, string>,
  _participant: Participant
) {
  Object.keys(changed).forEach(key =>
    screenShareTrackSidMap.value.set(key, changed[key] ?? '')
  )
}

// サウンドボードの再生は参加者として入ってくるが、入退室の効果音は鳴らさない
function handleParticipantConnected(participant: Participant) {
  if (isSoundboardIdentity(participant.identity)) return
  mixer.value?.playFileSource('qall_joined')
}

function handleParticipantDisconnected(participant: Participant) {
  if (isSoundboardIdentity(participant.identity)) return
  mixer.value?.playFileSource('qall_left')
}

/**
 * ルームに参加する
 *
 * 接続に失敗した場合は後始末をしてから例外を投げる
 */
const joinRoom = async (roomName: string, isWebinar: boolean = false) => {
  try {
    const endpoint = (await apis.getQallEndpoints()).data.endpoint
    const token = (await apis.getLiveKitToken(roomName, isWebinar)).data.token

    // pre-warm connection, this can be called as early as your page is loaded
    //room.prepareConnection("https://livekit-test.trap.show:39357", token);
    room.value = new Room({ dynacast: true, adaptiveStream: true })
    await room.value.prepareConnection(endpoint, token)

    // set up event listeners
    room.value
      .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
      .on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange)
      .on(RoomEvent.Disconnected, handleDisconnect)
      .on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished)
      .on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished)
      .on(RoomEvent.DataReceived, handleDataReceived)
      .on(
        RoomEvent.ParticipantAttributesChanged,
        handleParticipantAttributesChanged
      )
      .on(RoomEvent.ParticipantConnected, handleParticipantConnected)
      .on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)

    // connect to room
    await room.value.connect(endpoint, token)

    if (room.value.localParticipant?.permissions?.canPublish) {
      await addMicTrack()
    }

    await room.value.localParticipant.setAttributes({})
    room.value.remoteParticipants.forEach(participant => {
      Object.keys(participant.attributes).forEach(key => {
        screenShareTrackSidMap.value.set(key, participant.attributes[key] ?? '')
      })
    })

    const mixerContext = new ExtendedAudioContext()
    mixerAudioContext.value = mixerContext
    void setAudioContextSinkId(
      mixerContext,
      rtcSettings.audioOutputDeviceId.value
    )
    mixer.value = new AudioStreamMixer(
      mixerContext,
      rtcSettings.masterVolume.value
    )
    await mixer.value.initializePromise
    await mixer.value.playFileSource('qall_start')
  } catch (e) {
    await leaveRoom({ silent: true })
    throw e
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
}

const handleBeforeUnload = () => {
  void leaveRoom()
}

// 通話中に設定が変わったら反映する
watch(rtcSettings.masterVolume, v => {
  mixer.value?.setMasterVolume(v)
})
watch(rtcSettings.audioOutputDeviceId, deviceId => {
  if (mixerAudioContext.value) {
    void setAudioContextSinkId(mixerAudioContext.value, deviceId)
  }
})
const screenShareTracks = computed(() =>
  Array.from(screenShareTrackSidMap.value.entries())
)

async function leaveRoom({ silent = false }: { silent?: boolean } = {}) {
  // Leave the room by calling 'disconnect' method over the Room object
  await room.value?.disconnect()
  if (!silent) {
    await mixer.value?.playFileSource('qall_end')
  }

  await audioContext?.value?.close()
  audioContext.value = undefined
  // 効果音の再生が終わるまで待ってから閉じる
  const closingMixerContext = mixerAudioContext.value
  mixerAudioContext.value = undefined
  if (closingMixerContext) {
    setTimeout(() => {
      closingMixerContext.close().catch(e => {
        // eslint-disable-next-line no-console
        console.warn('[Qall] failed to close the audio context', e)
      })
    }, 2000)
  }

  // Empty all variables
  room.value = undefined
  tracksMap.value.clear()
  screenShareTrackSidMap.value.clear()
  mixer.value = undefined
  window.removeEventListener('beforeunload', handleBeforeUnload)
}

/**
 * マイクの入力を取得する
 *
 * 設定されたマイクが見つからない場合は既定のマイクを使う
 */
const getMicrophoneStream = async () => {
  const { audioInputDeviceId, noiseSuppression } = rtcSettings
  const constraints = (deviceId: string): MediaTrackConstraints => ({
    ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
    autoGainControl: true,
    echoCancellation: true,
    // RNNoise / Speex を使うときや「無効」のときにブラウザのノイズ抑制が重ならないようにする
    noiseSuppression: noiseSuppression.value === 'browser'
  })

  const deviceId = audioInputDeviceId.value
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: constraints(deviceId)
    })
  } catch (e) {
    // ブラウザによっては OverconstrainedError が DOMException ではないので名前で判定する
    const name = (e as { name?: unknown } | null)?.name
    const isDeviceMissing =
      name === 'OverconstrainedError' || name === 'NotFoundError'
    if (!deviceId || !isDeviceMissing) throw e
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: constraints('')
  })
  addInfoToast('設定されたマイクが見つからないため、既定のマイクを使用します')
  return stream
}

const addMicTrack = async () => {
  let stream: MediaStream | undefined

  const { noiseSuppression, noiseGateThreshold } = rtcSettings
  try {
    if (!room.value?.localParticipant?.permissions?.canPublish) {
      throw new Error('権限がありません')
    }

    if (!audioContext.value) {
      audioContext.value = new AudioContext()
    }

    stream = await getMicrophoneStream()
    const source = audioContext.value.createMediaStreamSource(stream)

    let lastNode: AudioNode = source

    if (noiseSuppression.value === 'rnnoise') {
      const [rnnoiseBinary] = await Promise.all([
        loadRnnoiseWasmBinary(),
        audioContext.value?.audioWorklet.addModule(rnnoiseWorkletPath)
      ])
      const rnnoiseNode = new RnnoiseWorkletNode(audioContext.value, {
        wasmBinary: rnnoiseBinary,
        maxChannels: 2
      })
      source.connect(rnnoiseNode)
      lastNode = rnnoiseNode
    } else if (noiseSuppression.value === 'speex') {
      const [speexBinary] = await Promise.all([
        loadSpeexWasmBinary(),
        audioContext.value?.audioWorklet.addModule(speexWorkletPath)
      ])
      const speexNode = new SpeexWorkletNode(audioContext.value, {
        wasmBinary: speexBinary,
        maxChannels: 2
      })
      source.connect(speexNode)
      lastNode = speexNode
    }

    // -100dB のときはノイズゲートを無効にする
    if (noiseGateThreshold.value > -100) {
      await audioContext.value.audioWorklet.addModule(noiseGateWorkletPath)
      const noiseGateNode = new NoiseGateWorkletNode(audioContext.value, {
        openThreshold: noiseGateThreshold.value,
        holdMs: 90,
        maxChannels: 2
      })
      lastNode.connect(noiseGateNode)
      lastNode = noiseGateNode
    }

    const destination = audioContext.value.createMediaStreamDestination()
    lastNode.connect(destination)

    const audioTrack = destination.stream.getAudioTracks()[0]
    if (!audioTrack) {
      throw new Error('Failed to get audio track')
    }

    audioTrackId.value = audioTrack.id
    const livekitAudioTrack = new LocalAudioTrack(audioTrack, undefined, false)
    livekitAudioTrack.source = Track.Source.Microphone

    // Publish the processed stream
    await room.value.localParticipant.publishTrack(livekitAudioTrack, {
      audioPreset: AudioPresets.speech,
      forceStereo: true,
      red: false,
      dtx: false
    })
    isMicOn.value = true
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    // Cleanup
    stream?.getTracks().forEach(track => track.stop())
    if (audioContext.value) {
      await audioContext.value.close()
      audioContext.value = undefined
    }
    if (e instanceof DOMException && e.name === 'NotAllowedError') {
      addErrorToast(
        'マイクの使用が許可されていません。ブラウザの設定を確認してください'
      )
    } else {
      addErrorToast('マイクの共有に失敗しました')
    }
  }
}
const removeMicTrack = async () => {
  try {
    if (!room.value) {
      addErrorToast('ルームが存在しません')
      return
    }
    for (const [_trackSid, trackInfo] of tracksMap.value) {
      if (trackInfo.isRemote) continue
      if (trackInfo.trackPublication?.track?.id === audioTrackId.value) {
        await trackInfo.trackPublication?.track?.mute()
      }
    }
    // await room.value.localParticipant.setMicrophoneEnabled(false)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    addErrorToast('マイクのミュートに失敗しました')
  }
}

const toggleMicTrack = async () => {
  if (!room.value) {
    addErrorToast('ルームが存在しません')
    return
  }
  if (isMicOn.value) {
    await removeMicTrack()
  } else {
    if (!room.value) {
      addErrorToast('ルームが存在しません')
      return
    }
    for (const [_trackSid, trackInfo] of tracksMap.value) {
      if (trackInfo.isRemote) continue
      if (trackInfo.trackPublication?.track?.id === audioTrackId.value) {
        await trackInfo.trackPublication?.track?.unmute()
      }
    }
  }
}

const addCameraTrack = async (
  videoInputDevice?: MediaDeviceInfo,
  backgroundType?: 'original' | 'blur' | 'file' | 'screen',
  backgroundFile?: File
) => {
  try {
    if (!room.value) {
      addErrorToast('ルームが存在しません')
      return
    }
    if (!room.value?.localParticipant?.permissions?.canPublish) {
      addErrorToast('権限がありません')
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

    if (backgroundType === 'blur') {
      options = {
        blurRadius: 10
      }
    } else if (backgroundType === 'file' && backgroundFile) {
      const blob = new Blob([backgroundFile], { type: backgroundFile.type })

      if (backgroundFile.type.startsWith('image/')) {
        //画像のとき
        const imageBitmap = await createImageBitmap(blob)
        options = {
          backgroundImage: imageBitmap
        }
      } else if (backgroundFile.type.startsWith('video/')) {
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
    } else if (backgroundType === 'screen') {
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
    // eslint-disable-next-line no-console
    console.error(e)
    addErrorToast('カメラの共有に失敗しました')
    return
  }
}

const drawVideoToCanvas = (video: HTMLVideoElement) => {
  const canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight)
  const canvasCtx = canvas.getContext('2d', {
    desynchronized: true
  })
  if (!canvasCtx) return
  const updateCanvas = () => {
    canvasCtx.drawImage(video, 0, 0)
    requestAnimationFrame(updateCanvas)
  }
  updateCanvas()
  return canvas
}

/**
 * 画面共有を開始する
 *
 * @returns 画面共有を開始したかどうか (共有する画面の選択をキャンセルした場合は false)
 */
const addScreenShareTrack = async (): Promise<boolean> => {
  try {
    if (!room.value) {
      addErrorToast('ルームが存在しません')
      return false
    }
    if (!room.value?.localParticipant?.permissions?.canPublish) {
      addErrorToast('権限がありません')
      return false
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
      screenShareTrackSidMap.value.set(videoSid, audioSid)
      await room.value.localParticipant.setAttributes({
        ...room.value.localParticipant.attributes,
        [videoSid]: audioSid
      })
    }
    return true
  } catch (e) {
    // 共有する画面の選択をキャンセルしただけのときはエラーを出さない
    if (
      e instanceof DOMException &&
      (e.name === 'NotAllowedError' || e.name === 'AbortError')
    ) {
      return false
    }
    // eslint-disable-next-line no-console
    console.error(e)
    addErrorToast('スクリーン共有に失敗しました')
    return false
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
      room.value.localParticipant.attributes
    await room.value.localParticipant.unpublishTrack(
      localpublication.track,
      true
    )
    await room.value.localParticipant.setAttributes(newAttributes)
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

const publishData = async (data: { type: 'stamp'; message: string }) => {
  if (!room.value) return
  const strData = JSON.stringify(data)
  const encoder = new TextEncoder()

  // publishData takes in a Uint8Array, so we need to convert it
  const encoded = encoder.encode(strData)
  await room.value.localParticipant.publishData(encoded, { reliable: true })
}
const decoder = new TextDecoder()
const isMicOn = ref(false)

export const useLiveKitSDK = () => {
  return {
    joinRoom,
    leaveRoom,
    addScreenShareTrack,
    addCameraTrack,
    removeVideoTrack,
    publishData,
    setTrackEnabled,
    setLocalTrackMute,
    toggleMicTrack,
    tracksMap,
    screenShareTrackSidMap,
    screenShareTracks,
    speakerIdentities,
    isMicOn,
    qallMitt
  }
}
