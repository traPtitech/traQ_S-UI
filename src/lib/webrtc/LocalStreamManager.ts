import type * as DTLN from '@sapphi-red/dtln-web'
import ExtendedAudioContext from './ExtendedAudioContext'
import { getUserAudio } from './userMedia'

type Options = {
  /**
   * スピーカーから出ている音
   */
  outputNode: AudioNode
  audioInputDeviceId: string
  enableNoiseReduction: boolean
  enableEchoCancellation: boolean
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
  private dtln: typeof DTLN | undefined

  inputStream!: MediaStream
  get outputStream() {
    return this.destination.stream
  }

  private source!: MediaStreamAudioSourceNode
  private dtlnProcessor: ScriptProcessorNode | undefined
  private dtlnAecChannelMerger: ChannelMergerNode | undefined
  private dtlnAecProcessor: ScriptProcessorNode | undefined
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
    enableNoiseReduction,
    enableEchoCancellation
  }: Options) {
    if (enableNoiseReduction || enableEchoCancellation) {
      await this.setupDtln({ enableNoiseReduction, enableEchoCancellation })
    }

    const newInputStream = await getUserAudio(audioInputDeviceId)
    this.unsetInput()

    this.inputStream = newInputStream

    this.source = this.context.createMediaStreamSource(this.inputStream)
    this.analyser = this.context.createAnalyserNode()

    let lastNode: AudioNode = this.source

    if (enableNoiseReduction) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.dtlnProcessor = this.dtln!.createDtlnProcessorNode(this.context, {
        channelCount: 2
      })
      lastNode.connect(this.dtlnProcessor)
      lastNode = this.dtlnProcessor
    }

    if (enableEchoCancellation) {
      this.dtlnAecChannelMerger = this.context.createChannelMerger(2)
      lastNode.connect(this.dtlnAecChannelMerger, 0, 0)
      this.options.outputNode.connect(this.dtlnAecChannelMerger, 0, 1)
      lastNode = this.dtlnAecChannelMerger

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.dtlnAecProcessor = this.dtln!.createDtlnAecProcessorNode(
        this.context
      )
      lastNode.connect(this.dtlnAecProcessor)
      lastNode = this.dtlnAecProcessor
    }

    lastNode.connect(this.analyser)
    lastNode.connect(this.destination)
  }

  private unsetInput() {
    this.inputStream?.getTracks().forEach(t => t.stop())
    this.source?.disconnect()
    this.dtlnProcessor?.disconnect()
    this.dtlnAecChannelMerger?.disconnect()
    this.dtlnAecProcessor?.disconnect()
    this.analyser?.disconnect()
  }

  /* set util methods */

  async setAudioInputDevice(audioInputDeviceId: string) {
    this.options.audioInputDeviceId = audioInputDeviceId

    await this.setInput(this.options)
  }

  async setEnableNoiseReduction(enableNoiseReduction: boolean) {
    this.options.enableNoiseReduction = enableNoiseReduction

    await this.setInput(this.options)
  }

  async setEnableEchoCancellation(enableEchoCancellation: boolean) {
    this.options.enableEchoCancellation = enableEchoCancellation

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

  /* dtln methods */

  private async setupDtln({
    enableNoiseReduction,
    enableEchoCancellation
  }: Pick<Options, 'enableNoiseReduction' | 'enableEchoCancellation'>) {
    if (!this.dtln) {
      const dtln = await import('@sapphi-red/dtln-web')
      await dtln.setup('/dtln-web/')
      this.dtln = dtln
    }

    const promises = []

    if (enableNoiseReduction) {
      promises.push(this.dtln.loadModel({ path: '/dtln-web/', quant: 'f16' }))
    }
    if (enableEchoCancellation) {
      promises.push(
        this.dtln.loadAecModel({ path: '/dtln-web/', units: 128, quant: 'f16' })
      )
    }

    await Promise.all(promises)
  }

  /* analyze methods */

  getLevel() {
    if (!this.analyser) {
      return 0
    }

    return this.context.getLevelFromNode(this.analyser)
  }
}
