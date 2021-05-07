<template>
  <div :class="$style.container" :aria-disabled="disabled">
    <icon :mdi="iconMdi" :name="iconName" :size="size" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'AudioPlayerAbstractButton',
  components: {
    Icon
  },
  props: {
    size: {
      type: Number,
      required: true
    },
    iconName: {
      type: String,
      required: true
    },
    iconMdi: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
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
    cursor: not-allowed;
    pointer-events: none;
  }
}
</style>
