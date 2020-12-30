import _store from '@/_store'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import { parse } from './markdown'
import { embeddingOrigin } from './apis'
import Token from 'markdown-it/lib/token'

export const formatUrl = (text: string, embeddingOrigin: string) => {
  try {
    const url = new URL(text)
    if (url.origin === embeddingOrigin) {
      if (url.pathname.startsWith('/messages/')) {
        return ' 添付メッセージ '
      } else if (url.pathname.startsWith('/files/')) {
        return ' 添付ファイル '
      }
    }
    return `${url.hostname}ドメインのURL`
  } catch {}

  if (!text.includes('://')) {
    text = `https://${text}`
  }
  try {
    const url = new URL(text)
    return `${url.hostname}ドメインのURL`
  } catch {
    return `不明なドメインのURL`
  }
}

export const format = (
  inputTokens: readonly Token[],
  embeddingOrigin: string
) => {
  const tokens = inputTokens.flatMap(token => {
    if (token.type === 'inline') return token.children || []
    return token
  })

  const rendered = []
  let isInLink = false
  let isInSpoiler = false
  for (const token of tokens) {
    if (token.type === 'link_close') {
      isInLink = false
      continue
    } else if (token.type === 'spoiler_close') {
      rendered.push(' ﾍﾟｹﾍﾟｹ ')
      isInSpoiler = false
      continue
    }

    if (isInLink) {
      if (token.type === 'text') {
        rendered.push(formatUrl(token.content, embeddingOrigin))
      }
      continue
    } else if (isInSpoiler) {
      continue
    }

    if (token.type === 'link_open') {
      isInLink = true
      continue
    } else if (token.type === 'spoiler_open') {
      isInSpoiler = true
      continue
    }

    if (token.type === 'text') {
      rendered.push(token.content)
    } else if (token.type === 'softbreak') {
      rendered.push('\n')
    } else if (token.type === 'regexp-0') {
      // stamp
      rendered.push(` ${token.meta.match[1]}スタンプ `)
    } else if (token.type === 'math_inline') {
      rendered.push(' 数式 ')
    } else if (token.type === 'math_block') {
      rendered.push('\n数式\n')
    } else if (token.type === 'fence') {
      rendered.push('\nコードブロック\n')
    } else if (token.type === 'code_inline') {
      rendered.push(token.content)
    }
  }
  return rendered.join('')
}

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
    const defaultRate = _store.state.app.rtcSettings.voiceRate
    const size = this.queue.length
    const ratio =
      1 +
      (size - START_SPEED_UP_COUNT) /
        (END_SPEED_UP_COUNT - START_SPEED_UP_COUNT)
    return defaultRate * Math.min(Math.max(ratio, 1), MAX_SPEED_RATIO)
  }

  private isNeeded(channelId: ChannelId): boolean {
    if (!_store.state.app.rtcSettings.isTtsEnabled) return false
    if (!store.getters.domain.rtc.qallSession) return false
    return store.getters.domain.rtc.currentRTCState?.channelId === channelId
  }

  private createUtter(text: string): SpeechSynthesisUtterance {
    const utter = new SpeechSynthesisUtterance(text)
    const voice = speechSynthesis
      .getVoices()
      .find(v => v.name === _store.state.app.rtcSettings.voiceName)
    if (voice) {
      utter.voice = voice
      utter.lang = voice.lang
    }
    utter.pitch = _store.state.app.rtcSettings.voicePitch
    utter.rate = this.getVoiceRate()
    utter.volume = _store.state.app.rtcSettings.voiceVolume
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

  stop() {
    this.queue.splice(0, this.queue.length)
    speechSynthesis.cancel()
  }
}

export const tts = new Tts()
