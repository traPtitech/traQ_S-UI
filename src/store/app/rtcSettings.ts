import { defineStore, acceptHMRUpdate } from 'pinia'
import { toRefs } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/composables/utils/useIndexedDbValue'

type State = {
  isTtsEnabled: boolean
  voiceName: string
  voicePitch: number
  voiceRate: number
  voiceVolume: number
}

const useRtcSettingsPinia = defineStore('app/rtcSettings', () => {
  const initialValue: State = {
    isTtsEnabled: false,
    voiceName: '',
    voicePitch: 1,
    voiceRate: 1.2,
    voiceVolume: 1
  }

  const [state] = useIndexedDbValue(
    'store/app/rtcSettings',
    1,
    {},
    initialValue
  )

  return { ...toRefs(state) }
})

export const useRtcSettings = convertToRefsStore(useRtcSettingsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRtcSettingsPinia, import.meta.hot))
}
