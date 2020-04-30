<template>
  <section>
    <div :class="$style.element">
      <div :class="$style.enable">
        <h3>RTC機能を有効にする (β)</h3>
        <toggle
          @input="state.isEnabled = !state.isEnabled"
          :enabled="state.isEnabled"
          :class="$style.toggle"
        />
      </div>
      <p :class="$style.content">
        通話などのリアルタイムコミュニケーション機能を有効化します<br />
        マイクなどへのアクセス許可が必要です
      </p>
    </div>
    <div v-if="rtcSettings.isEnabled" :class="$style.element">
      <h3>入力デバイス</h3>
      <div :class="$style.content">
        <form-selector
          v-if="!fetchFailed && audioInputDevices.length > 0"
          v-model="state.audioInputDeviceId"
          :options="audioInputDeviceOptions"
        />
        <p v-else>
          デバイスが取得できませんでした
        </p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  watchEffect
} from '@vue/composition-api'
import store from '@/store'
import useSyncedState from '../use/syncedState'
import Toggle from '@/components/UI/Toggle.vue'
import FormSelector from '@/components/UI/FormSelector.vue'

const useDevicesInfo = (state: { isEnabled: boolean }) => {
  const devices = ref<MediaDeviceInfo[]>([])
  const fetchFailed = ref(false)

  const fetchDeviceList = async () => {
    try {
      devices.value = await navigator.mediaDevices.enumerateDevices()
    } catch (e) {
      fetchFailed.value = true
    }
    if (devices.value.length === 0 || devices.value[0].label === '') {
      fetchFailed.value = true
    }
  }

  if (state.isEnabled) {
    fetchDeviceList()
  }

  watchEffect(async () => {
    if (state.isEnabled) {
      // offからonになったときは許可を求める
      await navigator.mediaDevices.getUserMedia({ audio: true })
      fetchDeviceList()
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

export default defineComponent({
  name: 'QallTab',
  setup() {
    const rtcSettings = computed(() => store.state.app.rtcSettings)
    const { state } = useSyncedState(
      rtcSettings,
      store.commit.app.rtcSettings.set
    )

    const devicesInfo = useDevicesInfo(state)

    const audioInputDeviceOptions = computed(() =>
      devicesInfo.audioInputDevices.value.map(d => ({
        key: d.label,
        value: d.deviceId
      }))
    )

    return { rtcSettings, state, ...devicesInfo, audioInputDeviceOptions }
  },
  components: {
    Toggle,
    FormSelector
  }
})
</script>

<style lang="scss" module>
h3 {
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
</style>
