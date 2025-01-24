import { defineStore, acceptHMRUpdate } from 'pinia'
import { toRefs } from 'vue'
import { getVuexData } from '/@/store/utils/migrateFromVuex'
import { isObjectAndHasKey } from '/@/lib/basic/object'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue, { key } from '/@/composables/utils/useIndexedDbValue'
import { promisifyRequest } from 'idb-keyval'
import type { NoiseSuppressionType } from '/@/lib/webrtc/LocalStreamManager'

type State = {
  isEnabled: boolean
  masterVolume: number
  audioInputDeviceId: string
  audioOutputDeviceId: string
  noiseSuppression: NoiseSuppressionType
  noiseGateThreshold: number
  isTtsEnabled: boolean
  voiceName: string
  voicePitch: number
  voiceRate: number
  voiceVolume: number
  isMute: boolean
}

const useRtcSettingsPinia = defineStore('app/rtcSettings', () => {
  const initialValue: State = {
    isEnabled: true,
    masterVolume: 0.5,
    audioInputDeviceId: '',
    audioOutputDeviceId: '',
    noiseSuppression: 'none',
    noiseGateThreshold: -100,
    isTtsEnabled: false,
    voiceName: '',
    voicePitch: 1,
    voiceRate: 1.2,
    voiceVolume: 1,
    isMute: false
  }

  const [state] = useIndexedDbValue(
    'store/app/rtcSettings',
    3,
    {
      // migrate from vuex
      1: async getStore => {
        const vuexStore = await getVuexData()
        if (!vuexStore) return
        if (!isObjectAndHasKey(vuexStore, 'app')) return
        if (!isObjectAndHasKey(vuexStore.app, 'rtcSettings')) return
        const addReq = getStore().add(vuexStore.app.rtcSettings, key)
        await promisifyRequest(addReq)
      },
      // delete `isEchoCancellationEnabled` & `isNoiseReductionEnabled`
      2: async getStore => {
        const store = getStore()
        const getReq = store.get(key)
        const state = await promisifyRequest<
          | {
              isEchoCancellationEnabled?: boolean
              isNoiseReductionEnabled?: boolean
            }
          | undefined
        >(getReq)
        delete state?.isEchoCancellationEnabled
        delete state?.isNoiseReductionEnabled
        const setReq = store.put(state, key)
        await promisifyRequest(setReq)
      },

      3: async getStore => {
        const store = getStore()
        const setReq = store.put({ isMute: false }, key)
        await promisifyRequest(setReq)
      }
    },
    initialValue
  )

  /**
   * 問題ないdeviceIdがセットされていることを確認する
   * セットされていなかったらセットする
   *
   * @returns 問題ないものがセットされているかどうか
   */
  const ensureDeviceIds = async () => {
    if (!state.isEnabled) return false

    // 許可を求める
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      return false
    }

    let devices: MediaDeviceInfo[]
    try {
      devices = await navigator.mediaDevices.enumerateDevices()
    } catch {
      return false
    }
    if (devices.length === 0 || devices[0]?.label === '') {
      return false
    }

    const audioInputDevices = devices.filter(
      device => device.kind === 'audioinput'
    )

    const isAlreadySet = audioInputDevices.some(
      d => d.deviceId === state.audioInputDeviceId
    )
    if (isAlreadySet) return true

    // デフォルトをセットする
    if (audioInputDevices[0]) {
      state.audioInputDeviceId = audioInputDevices[0].deviceId
      return true
    }
    return false
  }

  return { ...toRefs(state), ensureDeviceIds }
})

export const useRtcSettings = convertToRefsStore(useRtcSettingsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRtcSettingsPinia, import.meta.hot))
}
