import { defineStore, acceptHMRUpdate } from 'pinia'
import { toRefs, watch } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/use/indexedDbValue'
import store from '/@/vuex'

type State = {
  isEnabled: boolean
  masterVolume: number
  audioInputDeviceId: string
  audioOutputDeviceId: string
  isNoiseReductionEnabled: boolean
  isEchoCancellationEnabled: boolean
  isTtsEnabled: boolean
  voiceName: string
  voicePitch: number
  voiceRate: number
  voiceVolume: number
}

const useRtcSettingsPinia = defineStore('app/rtcSettings', () => {
  const initialValue: State = {
    isEnabled: true,
    masterVolume: 0.5,
    audioInputDeviceId: '',
    audioOutputDeviceId: '',
    isNoiseReductionEnabled: false,
    isEchoCancellationEnabled: false,
    isTtsEnabled: false,
    voiceName: '',
    voicePitch: 1,
    voiceRate: 1.2,
    voiceVolume: 1
  }

  const [state, loading, loadingPromise] = useIndexedDbValue(
    'app/rtcSettings',
    1,
    {
      0: async (db, tx) => {
        // TODO: migrate from vuex
        //
        // const vuexStore = indexedDBStorage.getItem('vuex')
        // if (!vuexStore) return
        // if (!isObjectAndHasKey(vuexStore, 'app')) return
        // if (!isObjectAndHasKey(vuexStore.app, 'rtcSettings')) return
        // tx.objectStore('store').add(vuexStore.app.rtcSettings, 'key')
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

  // TODO: app/rtc側でlistenする
  watch(state, (newState, oldState) => {
    if (newState.masterVolume !== oldState.masterVolume) {
      store.commit.app.rtc.setMasterVolume(newState.masterVolume)
    } else if (newState.audioInputDeviceId !== oldState.audioInputDeviceId) {
      store.dispatch.app.rtc.setAudioInputDeviceId(newState.audioInputDeviceId)
    } else if (
      newState.isNoiseReductionEnabled !== oldState.isNoiseReductionEnabled
    ) {
      store.dispatch.app.rtc.setIsNoiseReductionEnabled(
        newState.isNoiseReductionEnabled
      )
    } else if (
      newState.isEchoCancellationEnabled !== oldState.isEchoCancellationEnabled
    ) {
      store.dispatch.app.rtc.setIsEchoCancellationEnabled(
        newState.isEchoCancellationEnabled
      )
    }
  })

  return { ...toRefs(state), loading, loadingPromise, ensureDeviceIds }
})

export const useRtcSettings = convertToRefsStore(useRtcSettingsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRtcSettingsPinia, import.meta.hot))
}
