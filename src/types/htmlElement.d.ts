interface Document {
  pictureInPictureElement: PictureInPictureElement
}

interface PictureInPictureElement {
  play: () => Promise<void>
  pause: () => Promise<void>
}

interface HTMLCanvasElement {
  captureStream: () => MediaStream
}

interface HTMLAudioElement {
  captureStream: () => MediaStream
}

interface HTMLVideoElement {
  requestPictureInPicture: () => Promise<void>
}
interface Navigator {
  mediaSession: MediaSession
}

interface MediaSession {
  setActionHandler: (action: 'play' | 'pause', callback: () => void) => void
}
