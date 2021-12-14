import qallStartMp3 from '/@/assets/se/qall_start.mp3'
import qallEndMp3 from '/@/assets/se/qall_end.mp3'
import qallJoinedMp3 from '/@/assets/se/qall_joined.mp3'
import qallLeftMp3 from '/@/assets/se/qall_left.mp3'
import ExtendedAudioContext from './ExtendedAudioContext'

type StreamNodes = {
  source: MediaStreamAudioSourceNode
  streamVolumeGain: GainNode
  masterVolumeGain: GainNode
  analyser: AnalyserNode
}

export default class AudioStreamMixer {
  private _initializePromise: Promise<void>
  get initializePromise() {
    return this._initializePromise
  }

  readonly context: ExtendedAudioContext
  private readonly audioBufferMap = new Map<string, AudioBuffer>()
  private readonly streamMap = new Map<string, MediaStream>()
  private readonly streamNodesMap = new Map<string, StreamNodes>()

  private masterVolume: number
  private readonly fileVolume = 0.25
  private readonly streamVolumeMap = new Map<string, number>()

  private readonly maxFileGain = 1
  private readonly maxStreamGain = 5
  private readonly maxMasterGain = 3

  constructor(context: ExtendedAudioContext, masterVolume: number) {
    this._initializePromise = this.initialize()

    this.context = context
    this.masterVolume = masterVolume
  }

  private async initialize() {
    await Promise.all([
      this.addFileSource('qall_start', qallStartMp3),
      this.addFileSource('qall_end', qallEndMp3),
      this.addFileSource('qall_joined', qallJoinedMp3),
      this.addFileSource('qall_left', qallLeftMp3)
    ])
  }

  /* stream manage methods */

  private async addFileSource(key: string, url: string) {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()

    const decodedData = await this.context.decodeAudio(buffer)
    this.audioBufferMap.set(key, decodedData)
  }

  private addStream(key: string, stream: MediaStream) {
    if (stream.getAudioTracks().length === 0) {
      throw 'Invalid audio stream'
    }
    this.streamMap.set(key, stream)
  }

  private async removeStream(key: string) {
    if (!this.streamMap.has(key)) {
      // eslint-disable-next-line no-console
      console.warn(
        'audioStreamMixer::removeStream: 同じstreamを重複して取り除こうとした可能性があります'
      )
      return
    }

    this.streamMap.delete(key)

    if (this.streamMap.size === 0) {
      await this.context.suspend()
    }
  }

  /* node methods */

  private createMasterGainNode() {
    return this.context.createGainNode(this.masterVolume, this.maxMasterGain)
  }

  private createStreamGainNode(key: string) {
    return this.context.createGainNode(
      this.getStreamVolume(key),
      this.maxStreamGain
    )
  }

  /* play methods */

  async playFileSource(key: string) {
    const suspended = this.context.state === 'suspended'
    const buffer = this.audioBufferMap.get(key)
    if (!buffer) {
      throw new Error(`Unloaded buffer: key name of ${key}}`)
    }

    const source = this.context.createBufferSourceNode(buffer)
    const fileVolumeGain = this.context.createGainNode(
      this.fileVolume,
      this.maxFileGain
    )
    const masterVolumeGain = this.createMasterGainNode()
    source.connect(fileVolumeGain)
    fileVolumeGain.connect(masterVolumeGain)
    masterVolumeGain.connect(this.context.destination)

    if (suspended) {
      await this.context.resume()
    }

    source.addEventListener(
      'ended',
      () => {
        source.disconnect()
        fileVolumeGain.disconnect()
        masterVolumeGain.disconnect()

        if (suspended) {
          this.context.suspend()
        }
      },
      { once: true }
    )

    source.start(0)
  }

  async playStream(key: string) {
    if (this.context.state === 'suspended') {
      await this.context.resume()
    }
    const stream = this.streamMap.get(key)
    if (!stream) {
      throw new Error(`Unloaded stream: key name of ${key}}`)
    }

    const source = this.context.createMediaStreamSource(stream)
    const streamVolumeGain = this.createStreamGainNode(key)
    const analyser = this.context.createAnalyserNode()
    const masterVolumeGain = this.createMasterGainNode()
    source.connect(streamVolumeGain)
    streamVolumeGain.connect(analyser)
    streamVolumeGain.connect(masterVolumeGain)
    masterVolumeGain.connect(this.context.destination)

    // register audio for chrome
    const audio = document.createElement('audio')
    audio.srcObject = stream
    audio.volume = 0

    this.streamNodesMap.set(key, {
      source,
      streamVolumeGain,
      masterVolumeGain,
      analyser
    })
  }

  async stopStream(key: string) {
    const stream = this.streamMap.get(key)
    if (!stream) {
      throw new Error(`Unloaded stream: key name of ${key}}`)
    }

    const nodes = this.streamNodesMap.get(key)
    if (!nodes) {
      throw new Error(`Not started stream: key name of ${key}}`)
    }

    stream.getTracks().forEach(track => {
      track.stop()
    })
    nodes.source.disconnect()
    nodes.streamVolumeGain.disconnect()
    nodes.masterVolumeGain.disconnect()
    nodes.analyser.disconnect()
  }

  async addAndPlayStream(key: string, stream: MediaStream) {
    this.addStream(key, stream)
    await this.playStream(key)
  }

  async stopAndRemoveStream(key: string) {
    await this.stopStream(key)
    await this.removeStream(key)
  }

  /* volume methods */

  getStreamVolume(key: string) {
    return this.streamVolumeMap.get(key) ?? 1
  }

  setStreamVolume(key: string, volume: number) {
    const v = Math.max(0, Math.min(1, volume))
    this.streamVolumeMap.set(key, v)

    const nodes = this.streamNodesMap.get(key)
    if (!nodes) return

    this.context.setGainNodeVolume(
      nodes.streamVolumeGain,
      v,
      this.maxStreamGain
    )
  }

  setMasterVolume(volume: number) {
    const v = Math.max(0, Math.min(1, volume))

    this.streamNodesMap.forEach(({ masterVolumeGain }) => {
      this.context.setGainNodeVolume(masterVolumeGain, v, this.maxMasterGain)
    })
  }

  /* analyze methods */

  getLevelOfStream(key: string) {
    const nodes = this.streamNodesMap.get(key)
    if (!nodes) {
      return 0
    }
    return this.context.getLevelFromNode(nodes.analyser)
  }
}
