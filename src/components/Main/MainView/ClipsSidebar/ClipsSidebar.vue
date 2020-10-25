<template>
  <main-view-sidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <main-view-sidebar-page>
        <template #header>
          <!--TODO: ヘッダのコンポーネント分離-->
          <clips-sidebar-header :clip-folder-id="clipFolderId" />
        </template>
        <template #content>
          <clips-sidebar-content :clip-folder-id="clipFolderId" />
        </template>
      </main-view-sidebar-page>
    </template>
  </main-view-sidebar>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ClipFolderId } from '@/types/entity-ids'
import useSidebar from '@/use/sidebar'
import MainViewSidebar from '@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import MainViewSidebarPage from '@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
import ClipsSidebarHeader from './ClipsSidebarHeader.vue'
import ClipsSidebarContent from './ClipsSidebarContent.vue'

export default defineComponent({
  name: 'ClipsSidebar',
  components: {
    MainViewSidebar,
    MainViewSidebarPage,
    ClipsSidebarHeader,
    ClipsSidebarContent
  },
  props: {
    clipFolderId: {
      type: String as PropType<ClipFolderId>,
      requried: true
    },
    isSidebarOpenerReady: {
      type: Boolean,
      required: true
    }
  },
  setup() {
    const { closeSidebar } = useSidebar()

    return {
      closeSidebar
    }
  }
})
</script>
