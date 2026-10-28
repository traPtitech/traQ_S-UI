<template>
  <PrimaryViewSidebarPage
    :show-close-button="showCloseButton"
    show-back-button
    @back="emit('moveBack')"
  >
    <template #header>
      <SidebarHeader text="デフォルトの通知設定" />
    </template>
    <template #content> </template>
  </PrimaryViewSidebarPage>
</template>

<script lang="ts" setup>
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'

import SidebarHeader from '../PrimaryViewSidebar/SidebarHeader.vue'

withDefaults(
  defineProps<{
    defaultNotification: string
    showCloseButton?: boolean
  }>(),
  {
    showCloseButton: true
  }
)

const emit = defineEmits<{
  (e: 'moveBack'): void
}>()
</script>
