<template>
  <div :class="$style.container">
    <teleport v-if="isReady" to="#header">
      <slot name="header" />
    </teleport>
    <div :class="$style.content">
      <slot />
    </div>
    <div :class="$style.sidebar">
      <slot name="sidebar" />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  isReady: boolean
}>()
</script>

<style lang="scss" module>
.container {
  display: flex;
  height: 100%;
}

.content {
  min-width: 0;
  width: 100%;
}

.sidebar {
  height: 100%;
  flex-shrink: 0;
  z-index: $z-index-sidebar;
}
</style>
