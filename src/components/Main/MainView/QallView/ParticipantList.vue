<script setup lang="ts">
import UserIcon from '/@/components/UI/UserIcon.vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useUserVolume } from '/@/store/app/userVolume'
import { ref, watch, useCssModule, computed } from 'vue'
import type { User } from '@traptitech/traq'

const { participant, trackInfo } = defineProps<{
  participant: User
  trackInfo: TrackInfo
}>()

const { getStore, setStore } = useUserVolume()

const parseToFloat = (value: number | string): number => {
  if (typeof value === 'number') return value
  return parseFloat(value)
}

const isMuted = ref(false)
const toggleMute = (trackInfo: TrackInfo) => {
  isMuted.value = !isMuted.value
}

const style = useCssModule()
const minValue = 0
const maxValue = 2
const volume = ref<number | string>(getStore(trackInfo.username) ?? 1)

const sliderStyle = computed(() => {
  const val = parseToFloat(volume.value)
  const percent = ((val - minValue) / (maxValue - minValue)) * 100
  const startColor = isMuted.value ? '#6b7d8a' : '#005BAC'
  // TODO ここもSCSS変数でかける？
  return {
    background: `
      linear-gradient(to right,
        ${startColor} 0%,
        ${startColor} ${percent}%,
        #ced6db ${percent}%,
        #ced6db 100%)
    `
  }
})
watch(
  () => getStore(trackInfo.username),
  v => {
    if (v) {
      volume.value = v
    }
  },
  { deep: true }
)
watch(
  () => volume.value,
  v => {
    setStore(trackInfo.username, parseToFloat(v))
  },
  { deep: true, immediate: true }
)
const volumeSliderClass = computed(() => ({
  [style.volumeSlider]: true,
  [style.muted]: isMuted.value
}))
</script>

<template>
  <div :class="$style.container">
    <div :class="$style.leftSide">
      <user-icon :size="40" :user-id="participant.id" />
      <span :class="$style.userName">{{ participant.displayName }}</span>
      <!-- TODO: Qall: ミュートを実装する -->
      <!-- <button :class="$style.micIconButton">
        <a-icon v-if="isMuted" name="microphone-off" mdi />
      </button> -->
    </div>
    <div :class="$style.rightSide">
      <!-- <button :class="$style.iconButton" @click="toggleMute(trackInfo)">
        <a-icon v-if="isMuted" name="volume-off" :size="24" mdi />
        <a-icon v-else name="volume-high" mdi :size="24" />
      </button> -->
      <input
        v-model="volume"
        type="range"
        :min="minValue"
        :max="maxValue"
        step="0.01"
        :style="sliderStyle"
        :class="volumeSliderClass"
      />
    </div>
  </div>
</template>

<style lang="scss" module>
.container {
  padding: 8px;
  border-bottom: 1px solid rgba(206, 214, 219, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:last-child {
    border-bottom: none;
  }
  @include background-primary;
}

.leftSide {
  display: flex;
  align-items: center;
}

.userName {
  line-height: 24px;
  margin-left: 12px;
}

.micIconButton {
  margin-left: 4px;
  color: black;
  cursor: pointer;
}

.rightSide {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.iconButton {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.volumeSlider {
  width: 100px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background: transparent;
  border-radius: 8px;

  &::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 8px;
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: $theme-ui-primary-default;
    border-radius: 8px;
    cursor: pointer;
    margin-top: -4px;
  }
  &::-moz-range-track {
    -moz-appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 8px;
  }
  &::-moz-range-thumb {
    -moz-appearance: none;
    width: 16px;
    height: 16px;
    background: $theme-ui-primary-default;
    border-radius: 8px;
    cursor: pointer;
  }
  &::-ms-track {
    width: 100%;
    height: 8px;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
  &::-ms-fill-lower {
    border-radius: 8px;
  }
  &::-ms-fill-upper {
    border-radius: 8px;
  }
  &::-ms-thumb {
    width: 16px;
    height: 16px;
    background: $theme-ui-primary-default;
    border-radius: 8px;
    cursor: pointer;
  }
}

.muted::-webkit-slider-thumb {
  background: $theme-ui-secondary-default !important;
}
.muted::-moz-range-thumb {
  background: $theme-ui-secondary-default !important;
}
.muted::-ms-thumb {
  background: $theme-ui-secondary-default !important;
}

.accountMinusButton {
  cursor: pointer;
  color: $theme-accent-error-default;
}
</style>
