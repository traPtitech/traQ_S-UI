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
import SidebarPinnedList from './SidebarPinnedList.vue'
import { Pin } from '@traptitech/traq'

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
    const moveBack = () => {
      emit('moveBack')
    }
    return { moveBack }
  }
})
</script>
