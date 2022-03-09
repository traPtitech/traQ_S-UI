<template>
  <main-view-sidebar-page show-back-button @back="moveBack">
    <template #header>
      <sidebar-header text="ピン留め" />
    </template>
    <template #content>
      <sidebar-pinned-list :pinned-messages="pinnedMessages" />
    </template>
  </main-view-sidebar-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import MainViewSidebarPage from '/@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
import SidebarHeader from './SidebarHeader.vue'
import SidebarPinnedList from './SidebarPinned/SidebarPinnedList.vue'
import { Pin } from '@traptitech/traq'
import { provideMessageContextMenuStore } from './providers/messageContextMenu'

export default defineComponent({
  name: 'SidebarPinnedPage',
  components: {
    MainViewSidebarPage,
    SidebarHeader,
    SidebarPinnedList
  },
  props: {
    pinnedMessages: {
      type: Array as PropType<Pin[]>,
      default: () => []
    }
  },
  emits: {
    moveBack: () => true
  },
  setup(props, { emit }) {
    provideMessageContextMenuStore() // TODO: 後で消す

    const moveBack = () => {
      emit('moveBack')
    }

    return { moveBack }
  }
})
</script>
