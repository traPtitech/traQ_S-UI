<template>
  <section>
    <section :class="$style.element">
      <div :class="$style.enable">
        <section :class="$style.section">
          <h3 :class="$style.heading">RTC機能</h3>
          <p>
            通話などのRTC(リアルタイムコミュニケーション)機能を有効化します。
            マイクなどへのアクセス許可が必要です。
          </p>
        </section>
        <a-toggle v-model="state.isEnabled" :class="$style.toggle" />
      </div>
    </section>
    <template v-if="state.isEnabled">
      <section :class="$style.element">
        <div :class="$style.contents">
          <div :class="$style.enable">
            <section :class="$style.section">
              <h3 :class="$style.heading">メッセージの読み上げ</h3>
              <p>
                Qallしているチャンネルに投稿されたメッセージを読み上げます。
              </p>
            </section>
            <a-toggle v-model="state.isTtsEnabled" :class="$style.toggle" />
          </div>
          <div v-if="state.isTtsEnabled" :class="$style.contents">
            <form-selector
              v-if="voiceOptions.length > 0"
              v-model="state.voiceName"
              label="読み上げボイスの種類"
              :options="voiceOptions"
              :class="$style.option"
            />
            <p v-else>読み上げ音声の声の種類が取得できませんでした。</p>
            <form-input
              v-model.number="state.voicePitch"
              label="ピッチ"
              type="number"
              step="0.1"
              :class="$style.option"
            />
            <form-input
              v-model.number="state.voiceRate"
              label="速度"
              type="number"
              step="0.1"
              :class="$style.option"
            />
            <form-input
              v-model.number="state.voiceVolume"
              label="音量"
              type="number"
              step="0.1"
              :class="$style.option"
            />
          </div>
        </div>
      </section>
      <section :class="$style.element">
        <h3 :class="$style.heading">入力デバイス</h3>
        <div>
          <form-selector
            v-if="!fetchFailed && audioInputDevices.length > 0"
            v-model="state.audioInputDeviceId"
            :options="audioInputDeviceOptions"
          />
          <p v-else>デバイスが取得できませんでした。</p>
        </div>
      </section>
      <section :class="$style.element">
        <h3 :class="$style.heading">マスターボリューム</h3>
        <form-range-with-value
          v-model="state.masterVolume"
          max-text="100%"
          :min="0"
          :max="1"
          :interval="0.005"
          :format="formatMasterVolume"
        />
      </section>
      <section :class="$style.element">
        <h3 :class="$style.heading">ノイズゲート</h3>
        <p>
          マイクに入力された音が指定した音量以下だった場合にミュートします。
          -100dBにすると無効になります。
        </p>
        <form-range-with-value
          v-model="state.noiseGateThreshold"
          max-text="-100dB"
          :min="-100"
          :max="0"
          :interval="1"
          :format="formatNoiseGateThreshold"
          :class="$style.noiseGate"
        />
      </section>
      <noise-suppression
        v-model="state.noiseSuppression"
        :class="$style.element"
      />
    </template>
  </section>
</template>

<script lang="ts">
import { computed, ref, watchEffect, reactive } from 'vue'
import { useRtcSettings } from '/@/store/app/rtcSettings'

const useDevicesInfo = () => {
  const { isEnabled, ensureDeviceIds } = useRtcSettings()
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

  if (isEnabled.value) {
    fetchDeviceList()
  }

  watchEffect(() => {
    if (isEnabled.value) {
      ensureDeviceIds()
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

const useVoices = () => {
  const { voiceName } = useRtcSettings()
  const getVoicesAndSetDefault = () => {
    const voices = speechSynthesis.getVoices().filter(v => v.lang === 'ja-JP')

    const isAlreadySet = voices.some(v => v.name === voiceName.value)
    if (!isAlreadySet) {
      // デフォルトをセットする
      const defaultVoice = voices.find(v => v.default) || voices[0]
      if (defaultVoice) {
        voiceName.value = defaultVoice.name
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

  return voiceOptions
}
</script>

<script lang="ts" setup>
import AToggle from '/@/components/UI/AToggle.vue'
import FormSelector from '/@/components/UI/FormSelector.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import NoiseSuppression from '/@/components/Settings/QallTab/NoiseSuppression.vue'
import FormRangeWithValue from '/@/components/UI/FormRangeWithValue.vue'

const state = reactive(useRtcSettings())

const formatMasterVolume = (v: number) =>
  `${Math.round(state.masterVolume * 200)}%`

const formatNoiseGateThreshold = (v: number) => `${v}dB`

const { fetchFailed, audioInputDevices } = useDevicesInfo()

const audioInputDeviceOptions = computed(() =>
  audioInputDevices.value.map(d => ({
    key: d.label,
    value: d.deviceId
  }))
)

const voiceOptions = useVoices()
</script>

<style lang="scss" module>
.heading {
  margin-bottom: 4px;
}
.element {
  margin: 24px 0;
}
.enable {
  display: flex;
  align-items: center;
  .section {
    flex: 1;
  }
  .toggle {
    margin-left: 24px;
  }
}
.option {
  font-size: 12px;
}
.noiseGate {
  margin-top: 4px;
}
.contents {
  display: flex;
  flex-direction: column;
  row-gap: 16px;
}
</style>
