<template>
  <audio-player-abstract-button
    :disabled="disabled"
    :icon-name="isPlaying ? 'pause' : 'play'"
    icon-mdi
    :size="size"
    :title="isPlaying ? '一時停止する' : '再生する'"
    @click.prevent="toggle"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AudioPlayerAbstractButton from './AudioPlayerAbstractButton.vue'

export default defineComponent({
  name: 'AudioPlayerPlayButton',
  components: {
    AudioPlayerAbstractButton
  },
  props: {
    isPlaying: {
      type: Boolean,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const toggle = () => {
      emit('update:isPlaying', !props.isPlaying)
    }
    return { toggle }
  }
})
</script>
