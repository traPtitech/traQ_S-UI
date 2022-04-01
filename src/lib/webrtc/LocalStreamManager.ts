import ExtendedAudioContext from './ExtendedAudioContext'
import { getUserAudio } from './userMedia'

type Options = {
  /**
   * スピーカーから出ている音
   */
  outputNode: AudioNode
  audioInputDeviceId: string
  enableNoiseReduction: boolean
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
    enableNoiseReduction
  }: Options) {
    if (enableNoiseReduction) {
      // TODO
    }

    const newInputStream = await getUserAudio(audioInputDeviceId)
    this.unsetInput()

    this.inputStream = newInputStream

    this.source = this.context.createMediaStreamSource(this.inputStream)
    this.analyser = this.context.createAnalyserNode()

    const lastNode: AudioNode = this.source

    if (enableNoiseReduction) {
      // TODO
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

  /* analyze methods */

  getLevel() {
    if (!this.analyser) {
      return 0
    }

    return this.context.getLevelFromNode(this.analyser)
  }
}
