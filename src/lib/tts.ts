import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

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

export const tts = (channelId: ChannelId, text: string) => {
  if (!needTts(channelId)) return

  const utterThis = new SpeechSynthesisUtterance(text)
  setUtter(utterThis)
  speechSynthesis.speak(utterThis)
}
