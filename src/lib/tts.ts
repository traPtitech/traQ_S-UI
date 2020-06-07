import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import { parse } from './markdown'
import { embeddingOrigin } from './apis'
import Token from 'markdown-it/lib/token'

const needTts = (channelId: ChannelId) => {
  if (!store.getters.app.rtc.qallSession) return
  return (
    store.state.app.rtc.currentRTCState?.channelId === channelId &&
    store.state.app.rtcSettings.isTtsEnabled
  )
}

const setUtter = (utterThis: SpeechSynthesisUtterance) => {
  const voice = speechSynthesis
    .getVoices()
    .find(v => v.name === store.state.app.rtcSettings.voiceName)

  if (voice) {
    utterThis.lang = voice.lang
    utterThis.voice = voice
  }
  utterThis.pitch = store.state.app.rtcSettings.voicePitch
  utterThis.rate = store.state.app.rtcSettings.voiceRate
  utterThis.volume = store.state.app.rtcSettings.voiceVolume
}

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

export const format = (inputTokens: Token[], embeddingOrigin: string) => {
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

export const tts = async (
  channelId: ChannelId,
  userDisplayName: string,
  text: string
) => {
  if (!needTts(channelId)) return

  const tokens = await parse(text)
  const formatedText = format(tokens, embeddingOrigin)

  const utterThis = new SpeechSynthesisUtterance(
    `${userDisplayName}さん: ${formatedText}`
  )
  setUtter(utterThis)
  speechSynthesis.speak(utterThis)
}

// タブ閉じたときには止める
window.addEventListener('unload', () => {
  speechSynthesis.cancel()
})
