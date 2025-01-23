import { defineStore, acceptHMRUpdate } from 'pinia'
import { toRefs } from 'vue'
import { getVuexData } from '/@/store/utils/migrateFromVuex'
import { isObjectAndHasKey } from '/@/lib/basic/object'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue, { key } from '/@/composables/utils/useIndexedDbValue'
import { promisifyRequest } from 'idb-keyval'
import type { NoiseSuppressionType } from '/@/lib/webrtc/LocalStreamManager'

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
