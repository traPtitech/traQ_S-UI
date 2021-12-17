import type * as DTLN from '@sapphi-red/dtln-web'
import ExtendedAudioContext from './ExtendedAudioContext'
import { getUserAudio } from './userMedia'

type Options = {
  audioInputDeviceId: string
  enableNoiseReduction: boolean
}

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
    enableNoiseReduction
  }: Options) {
    if (enableNoiseReduction) {
      await this.setupDtln()
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
      this.source.connect(this.dtlnProcessor)

      lastNode = this.dtlnProcessor
    }

    lastNode.connect(this.analyser)
    lastNode.connect(this.destination)
  }

  private unsetInput() {
    this.inputStream?.getTracks().forEach(t => t.stop())
    this.source?.disconnect()
    this.dtlnProcessor?.disconnect()
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

  private async setupDtln() {
    if (this.dtln) return

    const dtln = await import('@sapphi-red/dtln-web')
    await dtln.setup('/dtln-web/')
    await dtln.loadModel({ path: '/dtln-web/', quant: 'f16' })

    this.dtln = dtln
  }

  /* analyze methods */

  getLevel() {
    if (!this.analyser) {
      return 0
    }

    return this.context.getLevelFromNode(this.analyser)
  }
}
