interface Document {
  readonly pictureInPictureEnabled: boolean
  readonly pictureInPictureElement: Element | null
}

interface HTMLPinPVideoElementEventMap extends HTMLMediaElementEventMap {
  enterpictureinpicture: Event
  leavepictureinpicture: Event
}

interface HTMLVideoElement {
  requestPictureInPicture(): Promise<PictureInPictureWindow>
  addEventListener<K extends keyof HTMLPinPVideoElementEventMap>(
    type: K,
    listener: (
      this: HTMLVideoElement,
      ev: HTMLPinPVideoElementEventMap[K]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => any,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener<K extends keyof HTMLPinPVideoElementEventMap>(
    type: K,
    listener: (
      this: HTMLVideoElement,
      ev: HTMLPinPVideoElementEventMap[K]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => any,
    options?: boolean | AddEventListenerOptions
  ): void
}

interface PictureInPictureWindow extends EventTarget {
  readonly width: number
  readonly height: number
  addEventListener(
    type: 'resize',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (this: HTMLVideoElement, ev: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener(
    type: 'resize',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (this: HTMLVideoElement, ev: Event) => any,
    options?: boolean | EventListenerOptions
  ): void
}
