<template>
  <div :class="$style.container">
    <div :class="$style.timeSlider">
      <slider
        :value="currentTime"
        @change="changeTime"
        :disabled="duration === 0"
        :min="0"
        :max="duration"
        tooltip="none"
      />
    </div>
    <div :class="$style.volume">
      <div :class="$style.volumeSlider">
        <slider
          :value="volume * 100"
          @change="changeVolume"
          :disabled="duration === 0"
          tooltip="none"
        />
      </div>
      <icon
        mdi
        :size="20"
        :name="volume > 0 ? 'volume-high' : 'volume-off'"
        @click="changeVolume(volume > 0 ? 0 : 100)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

import Icon from '@/components/UI/Icon.vue'

import Slider from '@/components/UI/Slider.vue'

export default defineComponent({
  name: 'ChromeAudioSlider',
  components: {
    Icon,
    Slider
  },
  props: {
    volume: {
      type: Number,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true
    }
  },
  setup(props, context) {
    const changeVolume = (vol: number) => {
      context.emit('changeVolume', vol)
    }
    const changeTime = (time: number) => {
      context.emit('changeTime', time)
    }
    return { changeVolume, changeTime }
  }
})
</script>

<style lang="scss" module>
$afterVolumeSliderWidth: 48px;

.container {
  pointer-events: none;
  display: flex;
}
.timeSlider {
  pointer-events: auto;
  flex: 1;
  transition: width 0.3s linear;
  margin: auto 16px auto 0;
}
.volume {
  padding: 4px;
  pointer-events: auto;
  display: flex;
  align-items: center;
  border-radius: 40px;
  &:hover {
    background-color: rgb(229, 231, 232);
    .volumeSlider {
      animation: volumeSlideIn linear 0.3s;
      width: $afterVolumeSliderWidth;
      opacity: 1;
      margin: auto 8px;
    }
  }
}
.volumeSlider {
  animation: volumeSlideOut linear 0.3s;
  opacity: 0;
}
@keyframes volumeSlideIn {
  0% {
    width: 0;
    margin: auto 0;
  }
  100% {
    width: $afterVolumeSliderWidth;
    margin: auto 8px;
  }
}
@keyframes volumeSlideOut {
  0% {
    width: $afterVolumeSliderWidth;
    opacity: 1;
    margin: auto 8px;
  }
  100% {
    width: 0;
    opacity: 1;
    margin: auto 0;
  }
}
</style>

<style lang="scss">
$dotBgColor: #1e1e1e;

$bgColor: #b7b9ba;
$themeColor: #585859;

@import '~vue-slider-component/lib/theme/default.scss';
</style>
