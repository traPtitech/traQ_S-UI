import qallStartMp3 from '/@/assets/se/qall_start.mp3'
import qallEndMp3 from '/@/assets/se/qall_end.mp3'
import qallJoinedMp3 from '/@/assets/se/qall_joined.mp3'
import qallLeftMp3 from '/@/assets/se/qall_left.mp3'
import ExtendedAudioContext from './ExtendedAudioContext'
import NodeMerger from './NodeMerger'

type StreamNodes = {
  source: MediaStreamAudioSourceNode
  volumeGain: GainNode
  analyser: AnalyserNode
}

/**
 * スピーカーに出力する音に対しての処理を行う
 *
 * @see https://github.com/traPtitech/traQ_S-UI/pull/2936#issue-805186669
 */
export default class AudioStreamMixer {
  private _initializePromise: Promise<void>
  get initializePromise() {
    return this._initializePromise
  }

  readonly context: ExtendedAudioContext
  private readonly audioBufferMap = new Map<string, AudioBuffer>()
  private readonly streamMap = new Map<string, MediaStream>()
  private readonly streamNodesMap = new Map<string, StreamNodes>()
  private readonly nodeMerger: NodeMerger
  readonly masterVolumeGain: GainNode

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

    this.nodeMerger = new NodeMerger(context)
    this.masterVolumeGain = this.context.createGainNode(
      this.masterVolume,
      this.maxMasterGain
    )

    this.nodeMerger.addOutput(this.masterVolumeGain)
    this.masterVolumeGain.connect(context.destination)
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
  }

  /* node methods */

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
    source.connect(fileVolumeGain)
    this.nodeMerger.addInput(fileVolumeGain)

    if (suspended) {
      await this.context.resume()
    }

    return new Promise<void>(resolve => {
      source.addEventListener(
        'ended',
        async () => {
          source.disconnect()
          fileVolumeGain.disconnect()

          if (suspended) {
            await this.context.suspend()
          }
          resolve()
        },
        { once: true }
      )

      source.start(0)
    })
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
    const volumeGain = this.createStreamGainNode(key)
    const analyser = this.context.createAnalyserNode()
    source.connect(volumeGain)
    volumeGain.connect(analyser)
    this.nodeMerger.addInput(volumeGain)

    // register audio for chrome
    const audio = document.createElement('audio')
    audio.srcObject = stream
    audio.volume = 0

    this.streamNodesMap.set(key, {
      source,
      volumeGain,
      analyser
    })
  }

  stopStream(key: string) {
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
    nodes.volumeGain.disconnect()
    nodes.analyser.disconnect()
  }

  async addAndPlayStream(key: string, stream: MediaStream) {
    if (this.streamMap.has(key)) {
      await this.stopAndRemoveStream(key)
    }

    this.addStream(key, stream)
    await this.playStream(key)
  }

  async stopAndRemoveStream(key: string) {
    this.stopStream(key)
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

    this.context.setGainNodeVolume(nodes.volumeGain, v, this.maxStreamGain)
  }

  setMasterVolume(volume: number) {
    const v = Math.max(0, Math.min(1, volume))
    this.context.setGainNodeVolume(this.masterVolumeGain, v, this.maxMasterGain)
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
