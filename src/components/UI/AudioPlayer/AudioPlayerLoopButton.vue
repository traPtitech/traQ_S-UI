<template>
  <audio-player-abstract-button
    :disabled="disabled"
    :icon-name="loop ? 'loop' : 'no-loop'"
    :size="size"
    :title="loop ? 'ループ再生を無効にする' : 'ループ再生を有効にする'"
    @click.prevent="toggle"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AudioPlayerAbstractButton from './AudioPlayerAbstractButton.vue'

export default defineComponent({
  name: 'AudioPlayerLoopButton',
  components: {
    AudioPlayerAbstractButton
  },
  props: {
    loop: {
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
  emits: {
    'update:loop': (_val: boolean) => true
  },
  setup(props, { emit }) {
    const toggle = () => {
      emit('update:loop', !props.loop)
    }
    return { toggle }
  }
})
</script>
