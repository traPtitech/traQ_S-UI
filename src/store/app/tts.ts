import { defineStore, acceptHMRUpdate } from 'pinia'
import { useRtcSettings } from '/@/store/app/rtcSettings'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ChannelId } from '/@/types/entity-ids'
import { parse } from '/@/lib/markdown/markdown'
import { format } from '/@/lib/tts/format'
import { embeddingOrigin } from '/@/lib/apis'
import { watchEffect } from 'vue'

interface Speach {
  channelId: ChannelId
  userDisplayName: string
  text: string
}

const START_SPEED_UP_COUNT = 3
const END_SPEED_UP_COUNT = 10
const MAX_SPEED_RATIO = 2
const MAX_CHAR_COUNT = 140

const useTtsPinia = defineStore('ui/tts', () => {
  const rtcSettings = useRtcSettings()
  let lastSpeachPromise = Promise.resolve()
  const queue: Speach[] = []

  const addQueue = (speach: Speach) => {
    queue.push(speach)
    lastSpeachPromise = lastSpeachPromise.then(() => {
      const next = queue.shift()
      return next ? speak(next) : Promise.resolve()
    })
  }

  // タブ閉じたときには止める
  window.addEventListener('pagehide', () => {
    stop()
  })

  // ttsが突然死ぬのを回避
  // https://github.com/traPtitech/traQ_S-UI/issues/1017
  setInterval(() => {
    speechSynthesis.pause()
    speechSynthesis.resume()
  }, 5000)

  const getVoiceRate = () => {
    const defaultRate = rtcSettings.voiceRate.value
    const size = queue.length
    const ratio =
      1 +
      (size - START_SPEED_UP_COUNT) /
        (END_SPEED_UP_COUNT - START_SPEED_UP_COUNT)
    return defaultRate * Math.min(Math.max(ratio, 1), MAX_SPEED_RATIO)
  }

  const createUtter = (text: string): SpeechSynthesisUtterance => {
    const utter = new SpeechSynthesisUtterance(text)
    const voice = speechSynthesis
      .getVoices()
      .find(v => v.name === rtcSettings.voiceName.value)
    if (voice) {
      utter.voice = voice
      utter.lang = voice.lang
    }
    utter.pitch = rtcSettings.voicePitch.value
    utter.rate = getVoiceRate()
    utter.volume = rtcSettings.voiceVolume.value
    return utter
  }

  const speak = async ({ userDisplayName, text }: Speach) => {
    const tokens = await parse(text)
    let formatedText = format(tokens, embeddingOrigin)

    if (formatedText.length > MAX_CHAR_COUNT) {
      formatedText = `${formatedText.slice(0, MAX_CHAR_COUNT)} 。以下略`
    }

    const utter = createUtter(`${userDisplayName}さん: ${formatedText}`)
    speechSynthesis.speak(utter)

    return new Promise<void>(resolve => {
      const endFunc = (e: SpeechSynthesisEvent) => {
        utter.removeEventListener('end', endFunc)
        utter.removeEventListener('error', endFunc)
        resolve()
      }

      utter.addEventListener('end', endFunc)
      utter.addEventListener('error', endFunc)
    })
  }

  const stop = () => {
    queue.splice(0, queue.length)
    speechSynthesis.cancel()
  }

  watchEffect(() => {
    if (!rtcSettings.isTtsEnabled) {
      stop()
    }
  })

  return { addQueue }
})

export const useTts = convertToRefsStore(useTtsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTtsPinia, import.meta.hot))
}
