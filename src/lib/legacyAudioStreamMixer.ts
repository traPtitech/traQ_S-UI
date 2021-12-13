const fileSourcePrefix = '__file-'

export const maxGain = 5
export const maxMasterGain = 3
export const talkingThreshoulds = [300, 1000, 3000, 5000]

export const getTalkingLoundnessLevel = (level = 0) => {
  let ll = 0
  for (const t of talkingThreshoulds) {
    if (level < t) return ll
    ll++
  }
  return ll
}

type WebkitWindow = Window &
  typeof globalThis & {
    webkitAudioContext: AudioContext
  }

export default class LegacyAudioStreamMixer {
  private streamSourceNodeMap = new Map<string, MediaStreamAudioSourceNode>()
  private audioBufferMap = new Map<string, AudioBuffer>()
  private analyserNodeMap = new Map<string, AnalyserNode>()
  private gainNodeMap = new Map<string, GainNode>()
  private context: AudioContext
  private masterVolume = 1
  private fileVolume = 0.25
  /**
   * それぞれのstreamのボリューム
   * ミュート時はミュートされる前の値を保持
   */
  private volumeMap = new Map<string, number>()
  readonly analyserFftSize = 128
  private readonly frequencyUint8Array = new Uint8Array(
    this.analyserFftSize / 2
  )

  constructor(volume: number) {
    this.context = new (window.AudioContext ||
      (window as WebkitWindow).webkitAudioContext)()
    this.volume = volume
  }

  private calcVolumeValue(gainNode: GainNode, userVolume: number): number {
    const { defaultValue } = gainNode.gain
    const userVolumeSquare = userVolume ** 2 * maxGain
    const masterVolumeSquare = this.masterVolume ** 2 * maxMasterGain
    return defaultValue * userVolumeSquare * masterVolumeSquare
  }

  private createAudioSourceNodeGraph(buffer: AudioBuffer) {
    const source = this.context.createBufferSource()
    const gain = this.context.createGain()
    source.buffer = buffer
    gain.gain.value = this.fileVolume
    gain.connect(this.context.destination)
    source.connect(gain)
    return source
  }

  private createStreamNodeGraph(mediaStream: MediaStream) {
    const source = this.context.createMediaStreamSource(mediaStream)
    const analyser = this.context.createAnalyser()
    const gain = this.context.createGain()
    gain.gain.value = this.calcVolumeValue(gain, 1)
    analyser.fftSize = this.analyserFftSize

    gain.connect(this.context.destination)
    analyser.connect(gain)
    source.connect(analyser)
    return { source, gain, analyser }
  }

  createAnalyzer(mediaStream: MediaStream) {
    const source = this.context.createMediaStreamSource(mediaStream)
    const analyser = this.context.createAnalyser()
    analyser.fftSize = this.analyserFftSize

    source.connect(analyser)
    return analyser
  }

  private disconnectNodeGraph(
    source: MediaStreamAudioSourceNode,
    analyser: AnalyserNode,
    gain: GainNode
  ) {
    source.disconnect(analyser)
    analyser.disconnect(gain)
    gain.disconnect(this.context.destination)
  }

  public async addStream(key: string, mediaStream: MediaStream) {
    if (this.context.state === 'suspended') {
      await this.context.resume()
    }
    if (mediaStream.getAudioTracks().length === 0) {
      throw 'Invalid audio stream'
    }
    if (key.startsWith(fileSourcePrefix)) {
      throw 'Cannot use this name as audio stream key'
    }
    const { source, gain, analyser } = this.createStreamNodeGraph(mediaStream)

    // register audio for chrome
    const audio = document.createElement('audio')
    audio.srcObject = mediaStream
    audio.volume = 0

    this.streamSourceNodeMap.set(key, source)
    this.analyserNodeMap.set(key, analyser)
    this.gainNodeMap.set(key, gain)
  }

  public async addFileSource(key: string, url: string) {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    const prefixedKey = fileSourcePrefix + key

    // iOS Safariはpromise-based syntaxに対応していない
    this.context.decodeAudioData(buffer, decodedData => {
      this.audioBufferMap.set(prefixedKey, decodedData)
    })
  }

  public async playFileSource(key: string) {
    const suspended = this.context.state === 'suspended'
    const prefixedKey = fileSourcePrefix + key
    const buffer = this.audioBufferMap.get(prefixedKey)
    if (!buffer) {
      throw new Error(`Unloaded buffer: key name of ${prefixedKey}}`)
    }

    const source = this.createAudioSourceNodeGraph(buffer)
    if (suspended) {
      await this.context.resume()
      source.addEventListener(
        'ended',
        () => {
          this.context.suspend()
        },
        { once: true }
      )
    }
    source.start(0)
  }

  public async removeStream(key: string) {
    if (!this.streamSourceNodeMap.has(key)) {
      // eslint-disable-next-line no-console
      console.warn(
        'audioStreamMixer::removeStream: 同じstreamを重複して取り除こうとした可能性があります'
      )
      return
    }

    this.disconnectNodeGraph(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.streamSourceNodeMap.get(key)!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.analyserNodeMap.get(key)!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.gainNodeMap.get(key)!
    )

    this.streamSourceNodeMap.delete(key)
    this.gainNodeMap.delete(key)
    this.volumeMap.delete(key)

    if (this.gainNodeMap.size === 0) {
      await this.context.suspend()
    }
  }

  public getVolumeOf(key: string) {
    return this.gainNodeMap.get(key)?.gain.value
  }

  public setAndSaveVolumeOf(key: string, volume: number) {
    const v = Math.max(0, Math.min(1, volume))
    const node = this.gainNodeMap.get(key)
    if (!node) return
    this.setVolumeOfGainNode(node, v)
    this.volumeMap.set(key, v)
  }

  public setVolumeOfGainNode(node: GainNode, userVolume: number) {
    const value = this.calcVolumeValue(node, userVolume)
    node.gain.setValueAtTime(value, this.context.currentTime)
  }

  public setfileVolume(volume: number) {
    this.fileVolume = volume
  }

  public getLevelOfNode(node?: AnalyserNode) {
    if (!node) return 0

    const arr = this.frequencyUint8Array
    node.getByteFrequencyData(arr)
    return arr.reduce((acc, cur) => acc + cur, 0)
  }

  public getLevelOf(key: string) {
    return this.getLevelOfNode(this.analyserNodeMap.get(key))
  }

  public muteAll() {
    this.gainNodeMap.forEach(node => {
      this.setVolumeOfGainNode(node, 0)
    })
  }

  public unmuteAll() {
    this.volumeMap.forEach((volume, key) => {
      const node = this.gainNodeMap.get(key)
      if (!node) return
      this.setVolumeOfGainNode(node, volume)
    })
  }

  set volume(v: number) {
    const newMasterVolume = Math.max(0, Math.min(1, v))
    if (this.masterVolume === newMasterVolume) return

    this.masterVolume = newMasterVolume
    this.gainNodeMap.forEach((node, key) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.setVolumeOfGainNode(node, this.volumeMap.get(key)!)
    })
  }
  get volume() {
    return this.masterVolume
  }
}
