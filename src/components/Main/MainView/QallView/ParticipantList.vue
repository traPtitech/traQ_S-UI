<script setup lang="ts">
import type { User } from '@traptitech/traq'

import { computed, ref, useCssModule, watch } from 'vue'

import UserIcon from '/@/components/UI/UserIcon.vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useQallVolume } from '/@/composables/qall/useQallVolume'

const { participant, trackInfo, deviceLabel } = defineProps<{
  participant: User
  trackInfo: TrackInfo
  /**
   * 同じユーザーが複数の端末で参加しているときの端末の表示名
   *
   * 指定されているときは、音量をこの端末だけ・通話中だけのものとして設定する
   */
  deviceLabel?: string
}>()

const { getVolume, setVolume } = useQallVolume()

const isMuted = ref(false)

const style = useCssModule()
const minValue = 0
const maxValue = 2
const volume = ref<number | string>(getVolume(trackInfo))

const sliderStyle = computed(() => {
  const val = Number(volume.value)
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
  () => getVolume(trackInfo),
  v => {
    if (Number(volume.value) !== v) {
      volume.value = v
    }
  }
)
const onInput = (e: Event) => {
  if (!(e.target instanceof HTMLInputElement)) return
  volume.value = e.target.value
  setVolume(trackInfo, Number(volume.value), {
    perDevice: deviceLabel !== undefined
  })
}
const volumeSliderClass = computed(() => ({
  [style.volumeSlider]: true,
  [style.muted]: isMuted.value
}))
</script>

<template>
  <div :class="$style.container">
    <div :class="$style.leftSide">
      <UserIcon :size="40" :user-id="participant.id" />
      <bdi :class="$style.userName">{{ participant.displayName }}</bdi>
      <span v-if="deviceLabel" :class="$style.deviceLabel">
        {{ deviceLabel }}
      </span>
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
        :value="volume"
        type="range"
        :min="minValue"
        :max="maxValue"
        step="0.01"
        :style="sliderStyle"
        :class="volumeSliderClass"
        :title="deviceLabel ? 'この端末の音量 (通話中のみ)' : undefined"
        @input="onInput"
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

.deviceLabel {
  margin-left: 8px;
  @include color-ui-secondary;
  @include size-caption;
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
