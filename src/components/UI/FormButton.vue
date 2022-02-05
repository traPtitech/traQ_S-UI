<template>
  <button
    :class="$style.container"
    :disabled="loading || disabled"
    :data-is-loading="$boolAttr(loading)"
    :data-color="color"
  >
    <div :class="$style.label">{{ label }}</div>
    <loading-spinner v-if="loading" :class="$style.spinner" />
  </button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import LoadingSpinner from '/@/components/UI/LoadingSpinner.vue'

export default defineComponent({
  name: 'FormButton',
  components: {
    LoadingSpinner
  },
  props: {
    label: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    color: {
      type: String as PropType<'primary' | 'secondary' | 'error'>,
      default: 'primary' as const
    }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  border: solid 2px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  &:disabled:not([data-is-loading]) {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &[data-is-loading] {
    cursor: wait;
  }
  &[data-color='primary'] {
    @include color-common-text-white-primary;
    @include background-accent-primary;
    border-color: $theme-accent-primary-default;
  }
  &[data-color='secondary'] {
    @include color-ui-secondary;
    border-color: $theme-ui-secondary;
  }
  &[data-color='error'] {
    color: $theme-accent-error-default;
    border-color: $theme-accent-error-default;
  }
}
.label {
  margin: 8px 32px;
  .container[data-is-loading] & {
    visibility: hidden;
  }
}

.spinner {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>
