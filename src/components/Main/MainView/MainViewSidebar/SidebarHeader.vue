<template>
  <h2 :class="$style.title">
    <slot />
  </h2>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SidebarHeader'
})
</script>

<style lang="scss" module>
.title {
  @include color-ui-primary;
  @include size-h2;
  display: flex;
  align-items: center;
  flex: 1;
  height: 100%;
  // 中身のtext-overflow: ellipsis用
  min-width: 0;
}
</style>
