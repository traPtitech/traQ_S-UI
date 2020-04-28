<template>
  <main-view-sidebar :style="styles.container" :class="$style.container">
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
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { ClipFolderId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import useSidebar from '@/use/sidebar'
import MainViewSidebar from '@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import ClipsSidebarHeader from './ClipsSidebarHeader.vue'
import ClipsSidebarContent from './ClipsSidebarContent.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.secondary
    }))
  })

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
    const styles = useStyles()
    const { closeSidebar } = useSidebar()

    return {
      styles,
      closeSidebar
    }
  }
})
</script>

<style lang="scss" module>
.container {
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
