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

<script lang="ts" setup>
import MainViewSidebarPage from '/@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue';
import SidebarHeader from './SidebarHeader.vue';
import SidebarPinnedList from './SidebarPinned/SidebarPinnedList.vue';
import { Pin } from '@traptitech/traq'

withDefaults(defineProps<{
    pinnedMessages?: Pin[]
}>(), {
    pinnedMessages: () => []
})

const emit = defineEmits<{
    (e: "moveBack"): void
}>();

const moveBack = () => {
  emit('moveBack')
}
</script>
