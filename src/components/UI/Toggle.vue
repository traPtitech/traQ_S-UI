<template>
  <div
    :class="$style.container"
    role="switch"
    :aria-checked="modelValue"
    :aria-disabled="disabled"
    @click="toggle"
  >
    <div :class="$style.knob"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Toggle',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    'update:modelValue': (_val: boolean) => true
  },
  setup(props, context) {
    const toggle = () => {
      if (props.disabled) return

      context.emit('update:modelValue', !props.modelValue)
    }

    return { toggle }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-tertiary;
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 22px;
  transition: all 0.2s ease;
  cursor: pointer;
  &[aria-checked='true'] {
    @include background-accent-primary;
  }
  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
.knob {
  @include background-primary;
  position: absolute;
  top: 4px;
  left: 6px;
  width: 16px;
  height: 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  .container[aria-checked='true'] & {
    transform: translateX(16px);
  }
}
</style>
