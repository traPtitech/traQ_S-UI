import ExtendedAudioContext from './ExtendedAudioContext'
import { getUserAudio } from './userMedia'

export default class LocalStreamManager {
  private _initializePromise: Promise<void>
  get initializePromise() {
    return this._initializePromise
  }

  readonly context: ExtendedAudioContext

  localStream!: MediaStream
  source!: MediaStreamAudioSourceNode
  analyser!: AnalyserNode

  constructor(context: ExtendedAudioContext, audioInputDeviceId: string) {
    this._initializePromise = this.initialize(audioInputDeviceId)

    this.context = context
  }

  async initialize(audioInputDeviceId: string) {
    await this.setAudioInputDeviceId(audioInputDeviceId)
  }

  deinitialize() {
    this.unsetAudioInputDeviceId()
  }

  async setAudioInputDeviceId(audioInputDeviceId: string) {
    const newLocalStream = await getUserAudio(audioInputDeviceId)
    this.unsetAudioInputDeviceId()

    this.localStream = newLocalStream

    this.source = this.context.createMediaStreamSource(this.localStream)
    this.analyser = this.context.createAnalyserNode()

    this.source.connect(this.analyser)
  }

  private unsetAudioInputDeviceId() {
    this.localStream?.getTracks().forEach(t => t.stop())
    this.source?.disconnect()
    this.analyser?.disconnect()
  }

  /* mute methods */
  mute() {
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = false
    })
  }

  unmute() {
    this.localStream.getAudioTracks().forEach(track => {
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
