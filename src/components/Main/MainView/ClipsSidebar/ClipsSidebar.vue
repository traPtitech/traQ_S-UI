<template>
  <main-view-sidebar :class="$style.container">
    <template #header>
      <!--TODO: ヘッダのコンポーネント分離-->
      <clips-sidebar-header
        :clip-folder-id="clipFolderId"
        :class="$style.sidebarItem"
      />
    </template>
    <template #content>
      <clips-sidebar-content :clip-folder-id="clipFolderId" />
    </template>
  </main-view-sidebar>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { ClipFolderId } from '@/types/entity-ids'
import useSidebar from '@/use/sidebar'
import MainViewSidebar from '@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import ClipsSidebarHeader from './ClipsSidebarHeader.vue'
import ClipsSidebarContent from './ClipsSidebarContent.vue'

export default defineComponent({
  name: 'ClipsSidebar',
  components: {
    MainViewSidebar,
    ClipsSidebarHeader,
    ClipsSidebarContent
  },
  props: {
    clipFolderId: { type: String as PropType<ClipFolderId>, requried: true }
  },
  setup() {
    const { closeSidebar } = useSidebar()

    return {
      closeSidebar
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  @include color-ui-secondary;
  display: flex;
  flex-direction: column;
  width: 320px;
  height: 100%;
  padding: 0 32px;
  overflow: auto;
}
.sidebarItem {
  margin: 16px 0;
}
</style>
