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

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ClipFolderId } from '/@/types/entity-ids'
import useSidebar from '/@/use/sidebar'
import MainViewSidebar from '/@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import MainViewSidebarPage from '/@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
import SidebarHeader from '/@/components/Main/MainView/MainViewSidebar/SidebarHeader.vue'
import ClipsSidebarContent from './ClipsSidebarContent.vue'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'

export default defineComponent({
  name: 'ClipsSidebar',
  components: {
    MainViewSidebar,
    MainViewSidebarPage,
    SidebarHeader,
    ClipsSidebarContent
  },
  props: {
    clipFolderId: {
      type: String as PropType<ClipFolderId>,
      required: true
    },
    isSidebarOpenerReady: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const { clipFoldersMap } = useClipFoldersStore()
    const { closeSidebar } = useSidebar()

    const clipFolderName = computed(
      () => clipFoldersMap.value.get(props.clipFolderId)?.name ?? ''
    )

    return {
      closeSidebar,
      clipFolderName
    }
  }
})
</script>
