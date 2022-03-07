import store from '/@/vuex'
import { ChannelId } from '/@/types/entity-ids'
import { parse } from '../markdown/markdown'
import { embeddingOrigin } from '../apis'
import { messageMitt } from '/@/vuex/entities/messages'
import { Message } from '@traptitech/traq'
import { format } from './format'

interface Speach {
  channelId: ChannelId
  userDisplayName: string
  text: string
}

const START_SPEED_UP_COUNT = 3
const END_SPEED_UP_COUNT = 10
const MAX_SPEED_RATIO = 2
const MAX_CHAR_COUNT = 140

class Tts {
  private lastSpeachPromise = Promise.resolve()
  private queue: Speach[] = []

  constructor() {
    messageMitt.on('addMessage', this.onAddMessage)

    // タブ閉じたときには止める
    window.addEventListener('unload', () => {
      this.stop()
    })

    // ttsが突然死ぬのを回避
    // https://github.com/traPtitech/traQ_S-UI/issues/1017
    setInterval(() => {
      speechSynthesis.pause()
      speechSynthesis.resume()
    }, 5000)
  }

  private getVoiceRate() {
    // TODO: piniaに移したら直す
    const defaultRate = 1 // store.state.app.rtcSettings.voiceRate
    const size = this.queue.length
    const ratio =
      1 +
      (size - START_SPEED_UP_COUNT) /
        (END_SPEED_UP_COUNT - START_SPEED_UP_COUNT)
    return defaultRate * Math.min(Math.max(ratio, 1), MAX_SPEED_RATIO)
  }

  private isNeeded(channelId: ChannelId): boolean {
    // TODO: piniaに移したら直す
    // if (!store.state.app.rtcSettings.isTtsEnabled) return false
    if (!store.getters.domain.rtc.qallSession) return false
    if (store.getters.domain.rtc.currentRTCState?.channelId !== channelId) {
      return false
    }
    return store.getters.app.rtc.isCurrentDevice
  }

  private createUtter(text: string): SpeechSynthesisUtterance {
    const utter = new SpeechSynthesisUtterance(text)
    const voice = speechSynthesis
      .getVoices()
      .find(v => v.name === store.state.app.rtcSettings.voiceName)
    if (voice) {
      utter.voice = voice
      utter.lang = voice.lang
    }
    utter.pitch = store.state.app.rtcSettings.voicePitch
    utter.rate = this.getVoiceRate()
    utter.volume = store.state.app.rtcSettings.voiceVolume
    return utter
  }

  private async speak({
    channelId,
    userDisplayName,
    text
  }: Speach): Promise<void> {
    if (!this.isNeeded(channelId)) return

    const tokens = await parse(text)
    let formatedText = format(tokens, embeddingOrigin)

    if (formatedText.length > MAX_CHAR_COUNT) {
      formatedText = `${formatedText.slice(0, MAX_CHAR_COUNT)} 。以下略`
    }

    const utter = this.createUtter(`${userDisplayName}さん: ${formatedText}`)
    speechSynthesis.speak(utter)

    return new Promise(resolve => {
      const endFunc = (e: SpeechSynthesisEvent) => {
        utter.removeEventListener('end', endFunc)
        utter.removeEventListener('error', endFunc)
        resolve()
      }

      utter.addEventListener('end', endFunc)
      utter.addEventListener('error', endFunc)
    })
  }

  addQueue(speach: Speach) {
    this.queue.push(speach)
    this.lastSpeachPromise = this.lastSpeachPromise.then(() => {
      const next = this.queue.shift()
      return next ? this.speak(next) : Promise.resolve()
    })
  }

  onAddMessage = ({ message }: { message: Message }) => {
    if (store.getters.domain.me.myId === message.userId) return

    const userDisplayName =
      store.state.entities.usersMap.get(message.userId)?.displayName ?? 'はてな'
    this.addQueue({
      channelId: message.channelId,
      userDisplayName,
      text: message.content
    })
  }

  stop() {
    messageMitt.off('addMessage', this.onAddMessage)
    this.queue.splice(0, this.queue.length)
    speechSynthesis.cancel()
  }
}

export const tts = new Tts()
