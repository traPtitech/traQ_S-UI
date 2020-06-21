<template>
  <button
    :class="$style.container"
    :disabled="disabled"
    @click="emit('click')"
    :data-color="color"
  >
    {{ label }}
  </button>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'

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
    color: {
      type: String as PropType<'primary' | 'secondary' | 'error'>,
      default: 'primary' as const
    }
  },
  setup(_, { emit }) {
    return { emit }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 8px 32px;
  border: solid 2px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &[data-color='primary'] {
    @include color-common-text-white-primary;
    @include background-accent-primary;
    border-color: $theme-accent-primary;
  }
  &[data-color='secondary'] {
    @include color-ui-secondary;
    border-color: $theme-ui-secondary;
  }
  &[data-color='error'] {
    color: $theme-accent-error;
    border-color: $theme-accent-error;
  }
}
</style>
