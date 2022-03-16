<template>
  <main-view-sidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <main-view-sidebar-page>
        <template #header>
          <sidebar-header
            icon-name="bookmark"
            icon-mdi
            :text="clipFolderName"
          />
        </template>
        <template #content>
          <clips-sidebar-content :clip-folder-id="clipFolderId" />
        </template>
      </main-view-sidebar-page>
    </template>
  </main-view-sidebar>
</template>

<script lang="ts" setup>
import MainViewSidebar from '/@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import MainViewSidebarPage from '/@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
import SidebarHeader from '/@/components/Main/MainView/MainViewSidebar/SidebarHeader.vue'
import ClipsSidebarContent from './ClipsSidebarContent.vue'
import { computed } from 'vue'
import { ClipFolderId } from '/@/types/entity-ids'
import useSidebar from '/@/composables/useSidebar'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'

const props = defineProps<{
  clipFolderId: ClipFolderId
  isSidebarOpenerReady: boolean
}>()

const { clipFoldersMap } = useClipFoldersStore()
const { closeSidebar } = useSidebar()

const clipFolderName = computed(
  () => clipFoldersMap.value.get(props.clipFolderId)?.name ?? ''
)
</script>
