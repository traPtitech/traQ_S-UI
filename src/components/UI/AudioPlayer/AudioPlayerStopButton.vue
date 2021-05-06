<template>
  <div :class="$style.container">
    <icon name="stop" :size="size" mdi />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'AudioPlayerStopButton',
  components: {
    Icon
  },
  props: {
    size: {
      type: Number,
      required: true
    }
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
