<template>
  <div :class="$style.container" @click.prevent="toggle">
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
  }
}
</style>
