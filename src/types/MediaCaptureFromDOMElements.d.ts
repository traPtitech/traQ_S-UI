interface HTMLMediaElement {
  captureStream(): MediaStream
}

interface HTMLCanvasElement {
  captureStream(frameRequestRate?: number): MediaStream
}
