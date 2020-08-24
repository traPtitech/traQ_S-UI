<template>
  <div :class="$style.container">
    <div :class="$style.timeSlider">
      <slider
        :value="roundedCurrentTime"
        @change="changeTime"
        :disabled="roundedDuration === 0"
        :min="0"
        :max="roundedDuration"
        tooltip="none"
      />
    </div>
    <div :class="$style.volume">
      <div :class="$style.volumeSlider">
        <slider
          :value="roundedVolume"
          @change="changeVolume"
          :disabled="roundedDuration === 0"
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
import { defineComponent, computed } from '@vue/composition-api'
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
    const roundedVolume = computed(() => Math.floor(props.volume * 100))
    const roundedCurrentTime = computed(() => Math.floor(props.currentTime))
    const roundedDuration = computed(() => Math.floor(props.duration))

    const changeVolume = (vol: number) => {
      context.emit('changeVolume', vol)
    }
    const changeTime = (time: number) => {
      context.emit('changeTime', time)
    }
    return {
      roundedVolume,
      roundedCurrentTime,
      roundedDuration,
      changeVolume,
      changeTime
    }
  }
})
</script>

<style lang="scss" module>
$afterVolumeSliderWidth: 48px;

.container {
  display: flex;
}
.timeSlider {
  flex: 1;
  padding: 16px;
  transition: width 0.3s linear;
}
.volume {
  display: flex;
  align-items: center;
  padding: 4px;
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
