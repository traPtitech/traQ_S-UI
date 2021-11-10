<template>
  <div :class="$style.container" :data-is-transparent="$boolAttr(transparent)">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EphemeralNavigationContentContainer',
  props: { transparent: { type: Boolean, default: false } },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-tertiary;
  width: 100%;
  height: 100%;
  border-top: {
    left-radius: 8px;
    right-radius: 8px;
  }
  &[data-is-transparent] {
    background: transparent;
  }
}
</style>
