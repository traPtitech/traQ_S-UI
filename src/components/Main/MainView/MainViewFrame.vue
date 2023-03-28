<template>
  <div :class="$style.container" :data-hide-outer="$boolAttr(hideOuter)">
    <div :class="$style.body">
      <slot></slot>
      <div :class="$style.overlay" :data-dim-inner="$boolAttr(dimInner)"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    isActive?: boolean
    hideOuter?: boolean
    dimInner?: boolean
  }>(),
  {
    isActive: true,
    hideOuter: false,
    dimInner: false
  }
)
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
  padding: $paddingSize 0;
  transition: opacity 0.3s ease;
  contain: strict;
}
.body {
  height: calc(100% + #{$paddingSize * 2});
  width: 100%;
  margin: -$paddingSize 0;
}
.overlay {
  @include background-common-overlay;
  opacity: 0;
  &[data-dim-inner] {
    opacity: 1;
  }
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
