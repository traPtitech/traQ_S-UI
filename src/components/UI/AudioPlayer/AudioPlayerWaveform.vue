<template>
  <div :class="$style.waveformWrapper" :style="waveformWrapperStyle">
    <div :class="$style.waveform" :style="waveformStyle"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'AudioPlayerWaveform',
  props: {
    waveformPath: {
      type: String,
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
  setup(props) {
    const playedPercentage = computed(() =>
      props.duration === 0 ? 0 : (props.currentTime / props.duration) * 100
    )
    const waveformStyle = computed(() => {
      const value = `url(${props.waveformPath})`
      return {
        '-webkit-mask-image': value,
        'mask-image': value
      }
    })
    const waveformWrapperStyle = computed(() => {
      const value = `linear-gradient(to right, rgba(0,0,0,.75), rgba(0,0,0,.75) ${playedPercentage.value}%, rgba(0,0,0,.25) ${playedPercentage.value}%, rgba(0,0,0,.25))`
      return {
        '-webkit-mask-image': value,
        'mask-image': value
      }
    })

    return { waveformStyle, waveformWrapperStyle }
  }
})
</script>

<style lang="scss" module>
.waveformWrapper {
  height: 60px;
  width: 100%;
}
.waveform {
  height: 100%;
  width: 100%;
  background-color: $theme-accent-primary;
  background-image: repeating-linear-gradient(90deg, #ccc, #333, #ccc 25%);
  background-blend-mode: overlay;
  mask-size: 100% 200%;
}
</style>
