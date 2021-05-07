<template>
  <audio-player-abstract-button
    icon-name="stop"
    icon-mdi
    :size="size"
    title="停止する"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AudioPlayerAbstractButton from './AudioPlayerAbstractButton.vue'

export default defineComponent({
  name: 'AudioPlayerStopButton',
  components: {
    AudioPlayerAbstractButton
  },
  props: {
    size: {
      type: Number,
      required: true
    }
  }
})
</script>
