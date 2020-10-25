<template>
  <main-view-sidebar-page>
    <template #header>
      <sidebar-header show-back-button @back="$emit('toggle')">
        ピン留め
      </sidebar-header>
    </template>
    <template #content>
      <sidebar-pinned-list :pinned-messages="pinnedMessages" />
    </template>
  </main-view-sidebar-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import MainViewSidebarPage from '@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
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
    pinnedMessages: { type: Array as PropType<Pin[]>, default: [] }
  }
})
</script>
