<template>
  <PrimaryViewSidebarPage show-back-button @back="emit('moveBack')">
    <template #header>
      <SidebarHeader text="ピン留め" />
    </template>
    <template #content>
      <SidebarPinnedList :pinned-messages="pinnedMessages" />
    </template>
  </PrimaryViewSidebarPage>
</template>

<script lang="ts" setup>
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'
import SidebarHeader from './SidebarHeader.vue'
import SidebarPinnedList from './SidebarPinned/SidebarPinnedList.vue'
import type { Pin } from '@traptitech/traq'

withDefaults(
  defineProps<{
    pinnedMessages?: Pin[]
  }>(),
  {
    pinnedMessages: () => []
  }
)

const emit = defineEmits<{
  (e: 'moveBack'): void
}>()
</script>
