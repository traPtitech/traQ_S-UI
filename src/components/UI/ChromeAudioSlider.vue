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
import { defineComponent, computed } from 'vue'
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
      context.emit('change-volume', vol)
    }
    const changeTime = (time: number) => {
      context.emit('change-time', time)
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

  :global {
    $dotBgColor: #1e1e1e;

    $bgColor: #b7b9ba;
    $themeColor: #585859;

    @import '~vue-slider-component/lib/theme/default.scss';
  }
}
.timeSlider {
  flex: 1;
  padding: 16px 8px;

  :global(.vue-slider-dot-handle) {
    opacity: 1;
    transition: opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  &:not(:hover) :global(.vue-slider-dot-handle) {
    opacity: 0;
  }
}
.volume {
  display: flex;
  align-items: center;
  padding: 4px;
  margin: auto;
  border-radius: 40px;
  &:hover {
    background-color: rgb(229, 231, 232);
  }
}
.volumeSlider {
  transition: width ease 0.3s, margin ease 0.3s, opacity ease 0.25s;
  width: 0;
  opacity: 0;
  margin: auto 0;
  .volume:hover & {
    transition: width ease 0.3s, margin ease 0.3s, opacity ease 0.25s;
    width: $afterVolumeSliderWidth;
    opacity: 1;
    margin: auto 8px;
  }

  :global(.vue-slider-dot-handle) {
    opacity: 1;
    transition: opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  &:not(:hover) :global(.vue-slider-dot-handle) {
    opacity: 0;
  }
}
</style>
