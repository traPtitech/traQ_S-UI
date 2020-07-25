<template>
  <div :class="$style.container" :data-hide-outer="hideOuter">
    <div :class="$style.body">
      <slot></slot>
      <div :class="$style.overlay" :data-dim-inner="dimInner"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'MainViewFrame',
  props: {
    isActive: {
      type: Boolean,
      default: true
    },
    hideOuter: {
      type: Boolean,
      default: false
    },
    dimInner: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    return {}
  }
})
</script>

<style lang="scss" module>
$paddingSize: 16px;
.container {
  opacity: 1;
  &[data-hide-outer] {
    opacity: 0.5;
    overflow: hidden;
  }
  position: relative;
  width: 100%;
  min-width: 0;
  margin: $paddingSize 0;
  border-radius: 4px;
  transition: opacity 0.3s ease;
}
.body {
  height: calc(100% + #{$paddingSize * 2});
  width: 100%;
  margin: -$paddingSize 0;
}
.overlay {
  opacity: 0;
  &[data-dim-inner] {
    opacity: 1;
  }
  background: $common-background-overlay;
  position: absolute;
  height: calc(100% + #{$paddingSize * 2});
  width: 100%;
  top: -$paddingSize;
  left: 0;
  z-index: $z-index-sidebar-overlay;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
</style>
