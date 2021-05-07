<template>
  <div
    :class="$style.container"
    :title="isPlaying ? '一時停止する' : '再生する'"
    :aria-disabled="disabled"
    @click.prevent="toggle"
  >
    <icon :name="isPlaying ? 'pause' : 'play'" :size="size" mdi />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'AudioPlayerPlayButton',
  components: {
    Icon
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

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 50%;
  &:not([aria-disabled='true']):hover {
    background: rgba(32, 33, 36, 0.06);
  }
  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}
</style>
