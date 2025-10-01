<template>
  <PrimaryViewSidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <PrimaryViewSidebarPage>
        <template #header>
          <SidebarHeader icon-name="bookmark" icon-mdi :text="clipFolderName" />
        </template>
        <template #content>
          <ClipsSidebarContent :clip-folder-id="clipFolderId" />
        </template>
      </PrimaryViewSidebarPage>
    </template>
  </PrimaryViewSidebar>
</template>

<script lang="ts" setup>
import PrimaryViewSidebar from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebar.vue'
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'
import SidebarHeader from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarHeader.vue'
import ClipsSidebarContent from './ClipsSidebarContent.vue'
import { computed } from 'vue'
import type { ClipFolderId } from '/@/types/entity-ids'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'

const props = defineProps<{
  clipFolderId: ClipFolderId
  isSidebarOpenerReady: boolean
}>()

const { clipFoldersMap } = useClipFoldersStore()
const clipFolderName = computed(
  () => clipFoldersMap.value.get(props.clipFolderId)?.name ?? ''
)
</script>
