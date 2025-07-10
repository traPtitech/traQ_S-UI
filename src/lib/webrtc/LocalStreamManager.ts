import {
  loadRnnoise as loadRnnoiseLib,
  loadSpeex as loadSpeexLib,
  NoiseGateWorkletNode,
  RnnoiseWorkletNode,
  SpeexWorkletNode
} from '@sapphi-red/web-noise-suppressor'
import noiseGateWorkletPath from '@sapphi-red/web-noise-suppressor/noiseGateWorklet.js?url'
import rnnoiseWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise.wasm?url'
import rnnoiseSimdWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise_simd.wasm?url'
import rnnoiseWorkletPath from '@sapphi-red/web-noise-suppressor/rnnoiseWorklet.js?url'
import speexWasmPath from '@sapphi-red/web-noise-suppressor/speex.wasm?url'
import speexWorkletPath from '@sapphi-red/web-noise-suppressor/speexWorklet.js?url'
import type ExtendedAudioContext from './ExtendedAudioContext'
import { getUserAudio } from './userMedia'

let rnnoiseWasmBinary: ArrayBuffer | undefined
const loadRnnoiseWasmBinary = async () => {
  if (rnnoiseWasmBinary) return rnnoiseWasmBinary
  rnnoiseWasmBinary = await loadRnnoiseLib({
    url: rnnoiseWasmPath,
    simdUrl: rnnoiseSimdWasmPath
  })
  return rnnoiseWasmBinary
}

let speexWasmBinary: ArrayBuffer | undefined
const loadSpeexWasmBinary = async () => {
  if (speexWasmBinary) return speexWasmBinary
  speexWasmBinary = await loadSpeexLib({ url: speexWasmPath })
  return speexWasmBinary
}

export const noiseSuppressionTypes = ['rnnoise', 'speex', 'none'] as const
export type NoiseSuppressionType = (typeof noiseSuppressionTypes)[number]

export const isNoiseSuppressionType = (
  value: string
): value is NoiseSuppressionType => {
  return (noiseSuppressionTypes as readonly string[]).includes(value)
}

type Options = {
  /**
   * スピーカーから出ている音
   */
  outputNode: AudioNode
  audioInputDeviceId: string
  noiseSuppression: NoiseSuppressionType
  /**
   * -100のときはノイズゲートを無効にする
   */
  noiseGateThreshold: number
}

/**
 * マイクからの音に対しての処理を行う
 *
 * @see https://github.com/traPtitech/traQ_S-UI/pull/3219
 */
export default class LocalStreamManager {
  private _initializePromise: Promise<void>
  get initializePromise() {
    return this._initializePromise
  }

  private readonly context: ExtendedAudioContext
  private readonly options: Options

  inputStream!: MediaStream
  get outputStream() {
    return this.destination.stream
  }

  private isMuted = false
  private nodes: AudioNode[] = []
  private analyser!: AnalyserNode
  private readonly destination: MediaStreamAudioDestinationNode

  constructor(context: ExtendedAudioContext, options: Options) {
    this.context = context
    this.options = options

    this._initializePromise = this.initialize(options)

    this.destination = context.createMediaStreamDestination()
  }

  async initialize(options: Options) {
    await this.setInput(options)
  }

  deinitialize() {
    this.unsetInput()
  }

  private async setInput({
    audioInputDeviceId,
    noiseSuppression,
    noiseGateThreshold
  }: Options) {
    const newInputStream = await getUserAudio(audioInputDeviceId)
    this.unsetInput()

    this.inputStream = newInputStream
    this.setInputStreamTrackEnabled(!this.isMuted)

    this.analyser = this.context.createAnalyserNode()
    this.nodes.push(this.analyser)

    const source = this.context.createMediaStreamSource(this.inputStream)
    this.nodes.push(source)

    let lastNode: AudioNode = source

    if (noiseSuppression === 'rnnoise') {
      const [rnnoiseBinary] = await Promise.all([
        loadRnnoiseWasmBinary(),
        this.ensureWorkletModule(rnnoiseWorkletPath)
      ])
      const rnnoiseNode = new RnnoiseWorkletNode(this.context, {
        wasmBinary: rnnoiseBinary,
        maxChannels: 2
      })
      this.nodes.push(rnnoiseNode)

      lastNode.connect(rnnoiseNode)
      lastNode = rnnoiseNode
    } else if (noiseSuppression === 'speex') {
      const [speexBinary] = await Promise.all([
        loadSpeexWasmBinary(),
        this.ensureWorkletModule(speexWorkletPath)
      ])
      const speexNode = new SpeexWorkletNode(this.context, {
        wasmBinary: speexBinary,
        maxChannels: 2
      })
      this.nodes.push(speexNode)

      lastNode.connect(speexNode)
      lastNode = speexNode
    }

    if (noiseGateThreshold !== -100) {
      await this.ensureWorkletModule(noiseGateWorkletPath)
      const noiseGateNode = new NoiseGateWorkletNode(this.context, {
        openThreshold: noiseGateThreshold,
        holdMs: 90,
        maxChannels: 2
      })
      this.nodes.push(noiseGateNode)

      lastNode.connect(noiseGateNode)
      lastNode = noiseGateNode
    }

    lastNode.connect(this.analyser)
    lastNode.connect(this.destination)
  }

  private unsetInput() {
    this.inputStream?.getTracks().forEach(t => t.stop())

    for (const node of this.nodes) {
      node.disconnect()
    }
    this.nodes = []
  }

  /* set util methods */

  async setAudioInputDevice(audioInputDeviceId: string) {
    this.options.audioInputDeviceId = audioInputDeviceId

    await this.setInput(this.options)
  }

  async setNoiseSuppression(noiseSuppression: NoiseSuppressionType) {
    this.options.noiseSuppression = noiseSuppression

    await this.setInput(this.options)
  }

  async setNoiseGateThreshold(noiseGateThreshold: number) {
    this.options.noiseGateThreshold = noiseGateThreshold

    await this.setInput(this.options)
  }

  /* mute methods */

  mute() {
    this.isMuted = true
    this.setInputStreamTrackEnabled(false)
  }

  unmute() {
    this.isMuted = false
    this.setInputStreamTrackEnabled(true)
  }

  private setInputStreamTrackEnabled(v: boolean) {
    this.inputStream.getAudioTracks().forEach(track => {
      track.enabled = v
    })
  }

  /* analyze methods */

  getLevel() {
    if (!this.analyser) {
      return 0
    }

    return this.context.getLevelFromNode(this.analyser)
  }

  /* @sapphi-red/web-noise-suppressor helper methods */

  private loadedWorkletModules = new Set<string>()
  private async ensureWorkletModule(path: string) {
    if (this.loadedWorkletModules.has(path)) return

    await this.context.audioWorklet.addModule(path)
    this.loadedWorkletModules.add(path)
  }
}
