type WebkitWindow = Window &
  typeof globalThis & {
    webkitAudioContext: AudioContext
  }

const _AudioContext =
  window.AudioContext || (window as WebkitWindow).webkitAudioContext

// TODO: Safari 14.1未満とiOS Safari 14.5未満はnodeのconstructorなどに対応していない

export default class ExtendedAudioContext extends _AudioContext {
  private readonly analyserFftSize = 128
  private readonly frequencyUint8Array = new Uint8Array(
    this.analyserFftSize / 2
  )

  /* node methods */

  createBufferSourceNode(buffer: AudioBuffer) {
    const node = this.createBufferSource()
    node.buffer = buffer
    return node
  }

  createGainNode(volume: number, maxGain: number) {
    const node = this.createGain()
    this.setGainNodeVolume(node, volume, maxGain)
    return node
  }

  setGainNodeVolume(node: GainNode, volume: number, maxGain: number) {
    node.gain.value = this.calcVolumeValue(volume, maxGain)
  }

  createAnalyserNode() {
    const node = this.createAnalyser()
    node.fftSize = this.analyserFftSize
    return node
  }

  /* analyze methods */

  getLevelFromNode(node: AnalyserNode) {
    const arr = this.frequencyUint8Array
    node.getByteFrequencyData(arr)
    return arr.reduce((acc, cur) => acc + cur, 0)
  }

  /* util methods */

  private calcVolumeValue(v: number, maxGain: number): number {
    return v ** 2 * maxGain
  }

  decodeAudio(buffer: ArrayBuffer) {
    return new Promise<AudioBuffer>((resolve, reject) => {
      super.decodeAudioData(buffer, resolve, reject)
    })
  }
}
