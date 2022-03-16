<template>
  <div :class="$style.container">
    <clips-view-content :clip-folder-id="clipFolderId" />
  </div>
</template>

<script lang="ts" setup>
import ClipsViewContent from './ClipsViewContent.vue';
import { ClipFolderId } from '/@/types/entity-ids'

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
