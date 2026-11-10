import { ref } from 'vue'

import mitt from 'mitt'

// Windows の Playwright WebKit は Web Audio API に未対応のため、
// 音声の初期化をスタブ化し、Qall とルームのストアは実際の実装を使う。
const unexpectedAudio = () => {
  throw new Error('Audio processing is outside the virtual scroll fixture')
}

export const useLiveKitSDK = () => ({
  joinRoom: unexpectedAudio,
  leaveRoom: unexpectedAudio,
  addScreenShareTrack: unexpectedAudio,
  addCameraTrack: unexpectedAudio,
  removeVideoTrack: unexpectedAudio,
  setLocalTrackMute: unexpectedAudio,
  publishData: unexpectedAudio,
  toggleMicTrack: unexpectedAudio,
  tracksMap: ref(new Map<string, unknown>()),
  screenShareTrackSidMap: ref(new Map<string, string>()),
  screenShareTracks: ref<unknown[]>([]),
  speakerIdentities: ref(new Set<string>()),
  isMicOn: ref(true),
  qallMitt: mitt()
})

export const useTts = () => ({ addQueue: unexpectedAudio })
