<template>
  <div :class="$style.timeSlider">
    <slider
      :value="roundedCurrentTime"
      :disabled="roundedDuration === 0"
      :min="0"
      :max="roundedDuration"
      tooltip="none"
      @change-value="changeTime"
      @click.prevent
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import Slider from '@/components/UI/Slider.vue'

export default defineComponent({
  name: 'AudioPlayerTimeSlider',
  components: {
    Slider
  },
  props: {
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
    const roundedCurrentTime = computed(() => Math.floor(props.currentTime))
    const roundedDuration = computed(() => Math.floor(props.duration))

    const changeTime = (time: number) => {
      context.emit('update:currentTime', time)
    }
    return {
      roundedCurrentTime,
      roundedDuration,
      changeTime
    }
  }
})
</script>

<style lang="scss" module>
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

  :global {
    $dotBgColor: #1e1e1e;

    $bgColor: #b7b9ba;
    $themeColor: #585859;

    @import '~vue-slider-component/lib/theme/default.scss';
  }
}
</style>
