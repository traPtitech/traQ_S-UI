<template>
  <PrimaryViewSidebarPage show-back-button @back="emit('moveBack')">
    <template #header>
      <SidebarHeader text="ピン留め" />
    </template>
    <template #content>
      <InfomationSidebarPinnedList :pinned-messages="pinnedMessages" />
    </template>
  </PrimaryViewSidebarPage>
</template>

<script lang="ts" setup>
import type { Pin } from '@traptitech/traq'

import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'

import SidebarHeader from '../PrimaryViewSidebar/SidebarHeader.vue'
import InfomationSidebarPinnedList from './InfomationSidebarPinned/InfomationSidebarPinnedList.vue'

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
