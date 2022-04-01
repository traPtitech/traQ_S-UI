import {
  loadRnnoise as loadRnnoiseLib,
  loadSpeex as loadSpeexLib,
  NoiseGateWorkletNode,
  RnnoiseWorkletNode,
  SpeexWorkletNode
} from '@sapphi-red/web-noise-suppressor'
import ExtendedAudioContext from './ExtendedAudioContext'
import { getUserAudio } from './userMedia'
import rnnoiseWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise.wasm?url'
import rnnoiseSimdWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise_simd.wasm?url'
import rnnoiseWorkletPath from '@sapphi-red/web-noise-suppressor/rnnoiseWorklet.js?url'
import speexWasmPath from '@sapphi-red/web-noise-suppressor/speex.wasm?url'
import speexWorkletPath from '@sapphi-red/web-noise-suppressor/speexWorklet.js?url'
import noiseGateWorkletPath from '@sapphi-red/web-noise-suppressor/noiseGateWorklet.js?url'

let rnnoiseWasmBinary: ArrayBuffer | undefined
const loadRnnoise = async (ctx: AudioContext) => {
  if (rnnoiseWasmBinary) return rnnoiseWasmBinary
  rnnoiseWasmBinary = await loadRnnoiseLib({
    url: rnnoiseWasmPath,
    simdUrl: rnnoiseSimdWasmPath
  })

  await ctx.audioWorklet.addModule(rnnoiseWorkletPath)
  return rnnoiseWasmBinary
}

let speexWasmBinary: ArrayBuffer | undefined
const loadSpeex = async (ctx: AudioContext) => {
  if (speexWasmBinary) return speexWasmBinary
  speexWasmBinary = await loadSpeexLib({ url: speexWasmPath })

  await ctx.audioWorklet.addModule(speexWorkletPath)
  return speexWasmBinary
}

let noiseGateLoaded = false
const loadNoiseGate = async (ctx: AudioContext) => {
  if (noiseGateLoaded) return

  noiseGateLoaded = true
  await ctx.audioWorklet.addModule(noiseGateWorkletPath)
}

export type NoiseSuppressionType = 'rnnoise' | 'speex' | 'none'

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
 * @see https://github.com/traPtitech/traQ_S-UI/pull/2936#issue-805186669
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

  private source!: MediaStreamAudioSourceNode
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

    this.source = this.context.createMediaStreamSource(this.inputStream)
    this.analyser = this.context.createAnalyserNode()

    let lastNode: AudioNode = this.source

    if (noiseSuppression === 'rnnoise') {
      const rnnoiseBinary = await loadRnnoise(this.context)
      const rnnoiseNode = new RnnoiseWorkletNode(this.context, {
        wasmBinary: rnnoiseBinary,
        maxChannels: 2
      })

      lastNode.connect(rnnoiseNode)
      lastNode = rnnoiseNode
    } else if (noiseSuppression === 'speex') {
      const speexBinary = await loadSpeex(this.context)
      const speexNode = new SpeexWorkletNode(this.context, {
        wasmBinary: speexBinary,
        maxChannels: 2
      })

      lastNode.connect(speexNode)
      lastNode = speexNode
    }

    if (noiseGateThreshold !== -100) {
      await loadNoiseGate(this.context)
      const noiseGateNode = new NoiseGateWorkletNode(this.context, {
        openThreshold: noiseGateThreshold,
        holdMs: 90,
        maxChannels: 2
      })

      lastNode.connect(noiseGateNode)
      lastNode = noiseGateNode
    }

    lastNode.connect(this.analyser)
    lastNode.connect(this.destination)
  }

  private unsetInput() {
    this.inputStream?.getTracks().forEach(t => t.stop())
    this.source?.disconnect()
    this.analyser?.disconnect()
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
    this.inputStream.getAudioTracks().forEach(track => {
      track.enabled = false
    })
  }

  unmute() {
    this.inputStream.getAudioTracks().forEach(track => {
      track.enabled = true
    })
  }

  /* analyze methods */

  getLevel() {
    if (!this.analyser) {
      return 0
    }

    return this.context.getLevelFromNode(this.analyser)
  }
}
