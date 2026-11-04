<template>
  <PrimaryViewSidebarPage
    :show-close-button="showCloseButton"
    show-back-button
    @back="emit('moveBack')"
  >
    <template #header>
      <SidebarHeader text="ピン留め" />
    </template>
    <template #content>
      <InformationSidebarPinnedList :pinned-messages="pinnedMessages" />
    </template>
  </PrimaryViewSidebarPage>
</template>

<script lang="ts" setup>
import type { Pin } from '@traptitech/traq'

import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'

import SidebarHeader from '../PrimaryViewSidebar/SidebarHeader.vue'
import InformationSidebarPinnedList from './InformationSidebarPinned/InformationSidebarPinnedList.vue'

withDefaults(
  defineProps<{
    pinnedMessages?: Pin[]
    showCloseButton?: boolean
  }>(),
  {
    pinnedMessages: () => [],
    showCloseButton: true
  }
)

const emit = defineEmits<{
  (e: 'moveBack'): void
}>()
</script>
