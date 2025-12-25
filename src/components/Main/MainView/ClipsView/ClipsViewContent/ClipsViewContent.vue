<template>
  <div :class="$style.container">
    <ClipsViewContentMain :clip-folder-id="clipFolderId" />
  </div>
</template>

<script lang="ts" setup>
import type { ClipFolderId } from '/@/types/entity-ids'

import ClipsViewContentMain from './ClipsViewContentMain.vue'

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
