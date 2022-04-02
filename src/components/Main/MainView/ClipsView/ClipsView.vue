<template>
  <primary-view-frame :is-ready="isReady">
    <template #header>
      <clips-header :clip-folder-id="clipFolderId" />
    </template>
    <template #default>
      <clips-view-content :clip-folder-id="clipFolderId" />
    </template>
    <template #sidebar>
      <clips-sidebar
        :clip-folder-id="clipFolderId"
        :is-sidebar-opener-ready="isReady"
      />
    </template>
  </primary-view-frame>
</template>

<script lang="ts" setup>
import PrimaryViewFrame from '../PrimaryViewFrame.vue'
import ClipsHeader from './ClipsHeader/ClipsHeader.vue'
import ClipsViewContent from './ClipsViewContent/ClipsViewContent.vue'
import ClipsSidebar from './ClipsSidebar/ClipsSidebar.vue'
import type { ClipFolderId } from '/@/types/entity-ids'

defineProps<{
  isReady: boolean
  clipFolderId: ClipFolderId
}>()
</script>
