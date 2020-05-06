<template>
  <div
    @click="$emit('input')"
    :class="$style.container"
    role="switch"
    :aria-checked="enabled ? 'true' : 'false'"
  >
    <div :class="$style.knob"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'Toggle',
  props: {
    enabled: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {}
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
