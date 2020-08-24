interface Navigator {
  readonly mediaSession: MediaSession
}

type MediaSessionPlaybackState = 'playing' | 'paused' | 'none'

type MediaSessionAction =
  | 'play'
  | 'pause'
  | 'seekbackward'
  | 'seekforward'
  | 'previoustrack'
  | 'nexttrack'
  | 'skipad'
  | 'stop'
  | 'seekto'

interface MediaSessionActionDetails {
  action: MediaSessionAction
  seekOffset?: number
  seekTime?: number
  fastSeek?: boolean
}

interface MediaSession {
  metadata: unknown
  playbackState: MediaSessionPlaybackState
  setActionHandler(
    action: MediaSessionAction,
    callback: ((details: MediaSessionActionDetails) => void) | null
  ): void
  setPositionState(state?: unknown): void
}
