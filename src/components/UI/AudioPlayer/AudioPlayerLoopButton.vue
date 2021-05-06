<template>
  <div :class="$style.container" @click.prevent="toggle">
    <icon :name="loop ? 'loop' : 'no-loop'" :size="size" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'AudioPlayerLoopButton',
  components: {
    Icon
  },
  props: {
    loop: {
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
      emit('update:loop', !props.loop)
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
