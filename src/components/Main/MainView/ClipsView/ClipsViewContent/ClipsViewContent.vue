<template>
  <div :class="$style.container">
    <clips-view-content-main :clip-folder-id="clipFolderId" />
  </div>
</template>

<script lang="ts" setup>
import ClipsViewContentMain from './ClipsViewContentMain.vue'
import type { ClipFolderId } from '/@/types/entity-ids'

defineProps<{
  clipFolderId: ClipFolderId
}>()
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  width: 100%;
  height: 100%;
  background: var(--specific-main-view-background);
}
</style>
