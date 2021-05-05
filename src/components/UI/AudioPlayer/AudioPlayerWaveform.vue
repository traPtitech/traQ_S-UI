<template>
  <div :class="$style.container"></div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import store from '@/store'

export default defineComponent({
  name: 'AudioPlayerWaveform',
  props: {
    waveformPath: {
      type: String,
      required: true
    }
  },
  setup() {

    return {}
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
