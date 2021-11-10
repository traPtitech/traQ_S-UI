<template>
  <section>
    <div :class="$style.element">
      <div :class="$style.enable">
        <h3 :class="$style.header">RTC機能を有効にする</h3>
        <a-toggle v-model="state.isEnabled" :class="$style.toggle" />
      </div>
      <p :class="$style.content">
        通話などのRTC(リアルタイムコミュニケーション)機能を有効化します<br />
        マイクなどへのアクセス許可が必要です
      </p>
    </div>
    <template v-if="state.isEnabled">
      <div :class="$style.element">
        <h3 :class="$style.header">マスターボリューム</h3>
        <div :class="[$style.content, $style.masterVolume]">
          <form-input
            v-model.number="state.masterVolume"
            :class="$style.masterVolumeRange"
            type="range"
            min="0"
            step="0.005"
            max="1"
          />
          <div :class="$style.masterVolumeValue">
            {{ Math.round(state.masterVolume * 200) }}%
          </div>
        </div>
      </div>
      <div :class="$style.element">
        <h3 :class="$style.header">入力デバイス</h3>
        <div :class="$style.content">
          <form-selector
            v-if="!fetchFailed && audioInputDevices.length > 0"
            v-model="state.audioInputDeviceId"
            :options="audioInputDeviceOptions"
          />
          <p v-else>デバイスが取得できませんでした</p>
        </div>
      </div>
      <div :class="$style.element">
        <div :class="$style.enable">
          <h3 :class="$style.header">メッセージの読み上げ</h3>
          <a-toggle v-model="state.isTtsEnabled" :class="$style.toggle" />
        </div>
        <p :class="$style.content">
          Qallしているチャンネルに投稿されたメッセージを読み上げます
        </p>
      </div>
      <div v-if="state.isTtsEnabled" :class="$style.element">
        <h3 :class="$style.header">メッセージ読み上げの声</h3>
        <div :class="$style.content">
          <form-selector
            v-if="voiceOptions.length > 0"
            v-model="state.voiceName"
            :options="voiceOptions"
          />
          <p v-else>読み上げ音声の声の種類が取得できませんでした</p>
          <form-input
            v-model.number="state.voicePitch"
            label="ピッチ"
            type="number"
            step="0.1"
          />
          <form-input
            v-model.number="state.voiceRate"
            label="速度"
            type="number"
            step="0.1"
          />
          <form-input
            v-model.number="state.voiceVolume"
            label="音量"
            type="number"
            step="0.1"
          />
        </div>
      </div>
    </template>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watchEffect } from 'vue'
import store from '/@/store'
import useSyncedState from '/@/components/Settings/use/syncedState'
import AToggle from '/@/components/UI/AToggle.vue'
import FormSelector from '/@/components/UI/FormSelector.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import { tts } from '/@/lib/tts'

const useDevicesInfo = (state: {
  isEnabled: boolean
  audioInputDeviceId: string
}) => {
  const devices = ref<MediaDeviceInfo[]>([])
  const fetchFailed = ref(false)

  const fetchDeviceList = async () => {
    try {
      devices.value = await navigator.mediaDevices.enumerateDevices()
    } catch (e) {
      fetchFailed.value = true
    }
    if (devices.value.length === 0 || devices.value[0]?.label === '') {
      fetchFailed.value = true
    }
  }

  if (state.isEnabled) {
    fetchDeviceList()
  }

  watchEffect(() => {
    if (state.isEnabled) {
      store.dispatch.app.rtcSettings.ensureDeviceIds()
    }
  })

  const audioInputDevices = computed(() =>
    devices.value.filter(d => d.kind === 'audioinput')
  )
  const audioOutputDevices = computed(() =>
    devices.value.filter(d => d.kind === 'audiooutput')
  )
  const videoInputDevices = computed(() =>
    devices.value.filter(d => d.kind === 'videoinput')
  )

  return {
    devices,
    fetchFailed,
    audioInputDevices,
    audioOutputDevices,
    videoInputDevices
  }
}

const useVoices = (state: { isTtsEnabled: boolean; voiceName: string }) => {
  const getVoicesAndSetDefault = () => {
    const voices = speechSynthesis.getVoices().filter(v => v.lang === 'ja-JP')

    const isAlreadySet = voices.some(v => v.name === state.voiceName)
    if (!isAlreadySet) {
      // デフォルトをセットする
      const defaultVoice = voices.find(v => v.default) || voices[0]
      if (defaultVoice) {
        state.voiceName = defaultVoice.name
      }
    }

    return voices
  }

  const voices = ref(getVoicesAndSetDefault())
  const voiceOptions = computed(() =>
    voices.value.map(v => ({
      key: `${v.name} (${v.lang})`,
      value: v.name
    }))
  )

  speechSynthesis.addEventListener?.('voiceschanged', () => {
    voices.value = getVoicesAndSetDefault()
  })

  watchEffect(() => {
    if (!state.isTtsEnabled) {
      tts.stop()
    }
  })

  return voiceOptions
}

export default defineComponent({
  name: 'QallTab',
  components: {
    AToggle,
    FormSelector,
    FormInput
  },
  setup() {
    const rtcSettings = computed(() => store.state.app.rtcSettings)
    const { state } = useSyncedState(
      rtcSettings,
      store.dispatch.app.rtcSettings.set
    )

    const devicesInfo = useDevicesInfo(state)

    const audioInputDeviceOptions = computed(() =>
      devicesInfo.audioInputDevices.value.map(d => ({
        key: d.label,
        value: d.deviceId
      }))
    )

    const voiceOptions = useVoices(state)

    return {
      state,
      ...devicesInfo,
      audioInputDeviceOptions,
      voiceOptions
    }
  }
})
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.element {
  margin: 24px 0;
}
.content {
  margin-left: 12px;
}
.enable {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  h3 {
    margin: 0;
  }
  .toggle {
    margin-left: 12px;
  }
}
.masterVolume {
  display: flex;
  align-items: center;
}
.masterVolumeRange {
  flex: 1 1;
}
.masterVolumeValue {
  width: 5ch;
  text-align: right;
}
</style>
