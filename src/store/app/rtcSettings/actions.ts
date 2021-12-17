import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '/@/store'
import { rtcSettings } from './index'
import { ActionContext } from 'vuex'
import { S } from './state'
import store from '/@/store'

export const rtcSettingsActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, rtcSettings)

export const actions = defineActions({
  /**
   * 問題ないdeviceIdがセットされていることを確認する
   * セットされていなかったらセットする
   *
   * @returns 問題ないものがセットされているかどうか
   */
  async ensureDeviceIds(context): Promise<boolean> {
    const { state, commit } = rtcSettingsActionContext(context)
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
      commit.set({ audioInputDeviceId: audioInputDevices[0].deviceId })
      return true
    }
    return false
  },
  set(context, newState: Partial<S>) {
    const { commit } = rtcSettingsActionContext(context)
    commit.set(newState)

    if (newState.masterVolume !== undefined) {
      store.commit.app.rtc.setMasterVolume(newState.masterVolume)
    } else if (newState.audioInputDeviceId !== undefined) {
      store.dispatch.app.rtc.setAudioInputDeviceId(newState.audioInputDeviceId)
    } else if (newState.isNoiseReductionEnabled !== undefined) {
      store.dispatch.app.rtc.setIsNoiseReductionEnabled(
        newState.isNoiseReductionEnabled
      )
    }
  }
})
