<template>
  <section :class="$style.container">
    <div>
      <h3>RTC機能を有効にする (β)</h3>
      <p>
        通話などのリアルタイムコミュニケーション機能を有効化します<br />
        マイクなどへのアクセス許可が必要です
      </p>
      <toggle
        @input="state.isEnabled = !state.isEnabled"
        :enabled="state.isEnabled"
      />
    </div>
    <div v-if="rtcSettings.isEnabled">
      <h3>入力デバイス</h3>
      <select
        v-if="!fetchFailed && audioInputDevices.length > 0"
        v-model="state.audioInputDeviceId"
      >
        <option
          v-for="device in audioInputDevices"
          :key="device.deviceId"
          :value="device.deviceId"
        >
          {{ device.label }}
        </option>
      </select>
      <p v-else>
        デバイスが取得できませんでした
      </p>
    </div>
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  ref,
  watchEffect,
  watch
} from '@vue/composition-api'
import store from '@/store'
import useStateDiff from '../use/stateDiff'
import Toggle from '@/components/UI/Toggle.vue'

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
    const state = reactive({ ...rtcSettings.value })
    const { getDiffKeys } = useStateDiff<typeof store.state.app.rtcSettings>()

    watchEffect(() => {
      const diffKeys = getDiffKeys(state, rtcSettings)
      diffKeys.forEach(key => {
        store.commit.app.rtcSettings.set([key, state[key]])
      })
    })

    const devicesInfo = useDevicesInfo(state)

    return { rtcSettings, state, ...devicesInfo }
  },
  components: {
    Toggle
  }
})
</script>

<style lang="scss" module>
.container {
  overflow: hidden;
}
</style>
