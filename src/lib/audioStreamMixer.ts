const fileSourcePrefix = '__file-'

export const maxGain = 5
export const maxMasterGain = 3
export const talkingThreshould = 300

export default class AudioStreamMixer {
  private streamSourceNodeMap: Record<string, MediaStreamAudioSourceNode> = {}
  private audioBufferMap: Record<string, AudioBuffer> = {}
  private analyserNodeMap: Record<string, AnalyserNode> = {}
  private gainNodeMap: Record<string, GainNode> = {}
  private context: AudioContext
  private masterVolume = 1
  private fileVolume = 0.25
  private previousVolumeMap: Record<string, number> = {}
  readonly analyserFftSize = 128

  constructor() {
    this.context = new ((window as any).AudioContext ||
      (window as any).webkitAudioContext)() as AudioContext
  }

  private async createAudioSourceNodeGraph(buffer: AudioBuffer) {
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
    gain.gain.value = 1 / maxGain
    analyser.fftSize = this.analyserFftSize

    gain.connect(this.context.destination)
    analyser.connect(gain)
    source.connect(analyser)
    return { source, gain, analyser }
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
    const { source, gain, analyser } = await this.createStreamNodeGraph(
      mediaStream
    )

    // register audio for chrome
    const audio = document.createElement('audio')
    audio.srcObject = mediaStream
    audio.volume = 0

    this.streamSourceNodeMap[key] = source
    this.analyserNodeMap[key] = analyser
    this.gainNodeMap[key] = gain
  }

  public async addFileSource(key: string, url: string) {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    const prefixedKey = fileSourcePrefix + key

    this.audioBufferMap[prefixedKey] = await this.context.decodeAudioData(
      buffer
    )
  }

  public async playFileSource(key: string) {
    const suspended = this.context.state === 'suspended'
    const prefixedKey = fileSourcePrefix + key
    const source = await this.createAudioSourceNodeGraph(
      this.audioBufferMap[prefixedKey]
    )
    if (suspended) {
      await this.context.resume()
      source.addEventListener('ended', () => {
        this.context.suspend()
      })
    }
    source.start(0)
  }

  public async removeStream(key: string) {
    this.disconnectNodeGraph(
      this.streamSourceNodeMap[key],
      this.analyserNodeMap[key],
      this.gainNodeMap[key]
    )

    delete this.gainNodeMap[key]
    delete this.streamSourceNodeMap[key]
    if (Object.keys(this.gainNodeMap).length === 0) {
      await this.context.suspend()
      console.log('audio context suspended')
    }
  }

  public getVolumeOf(key: string) {
    return this.gainNodeMap[key].gain.value
  }

  public setVolumeOf(key: string, volume: number) {
    const value = Math.max(0, Math.min(1, volume)) * maxGain
    this.gainNodeMap[key].gain.setValueAtTime(value, this.context.currentTime)
  }

  public setfileVolume(volume: number) {
    this.fileVolume = volume
  }

  public getByteFrequencyDataOf(key: string) {
    if (!this.analyserNodeMap[key]) {
      return new Uint8Array()
    }
    const arr = new Uint8Array(this.analyserFftSize / 2)
    this.analyserNodeMap[key].getByteFrequencyData(arr)
    return arr
  }

  public getLevelOf(key: string) {
    return this.getByteFrequencyDataOf(key).reduce((acc, cur) => acc + cur, 0)
  }

  public muteAll() {
    Object.keys(this.gainNodeMap).forEach(key => {
      this.previousVolumeMap[key] = this.getVolumeOf(key)
      this.setVolumeOf(key, 0)
    })
  }

  public unmuteAll() {
    Object.keys(this.previousVolumeMap).forEach(key => {
      if (!(key in this.gainNodeMap)) {
        return
      }
      this.setVolumeOf(key, this.previousVolumeMap[key])
    })
    this.previousVolumeMap = {}
  }

  set volume(v: number) {
    const newMasterVolume = Math.max(0, Math.min(1, v)) * maxMasterGain
    Object.values(this.gainNodeMap).forEach(
      gainNode =>
        (gainNode.gain.value =
          (gainNode.gain.value / this.masterVolume) * newMasterVolume)
    )
    this.masterVolume = newMasterVolume
  }
  get volume() {
    return this.masterVolume
  }
}
