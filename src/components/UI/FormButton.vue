<template>
  <button
    :class="$style.container"
    :disabled="disabled"
    @click="context.emit('click')"
    :data-is-error="error"
  >
    {{ label }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'FormButton',
  props: {
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    }
  },
  setup(_, context) {
    return { context }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-common-text-white-primary;
  @include background-accent-primary;
  padding: 8px 32px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &[data-is-error] {
    @include background-accent-error;
  }
}
</style>
