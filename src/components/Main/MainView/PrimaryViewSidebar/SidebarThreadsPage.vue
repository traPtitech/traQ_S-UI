<template>
  <PrimaryViewSidebarPage show-back-button @back="emit('moveBack')">
    <template #header>
      <SidebarHeader text="スレッド" />
    </template>
    <template #content>
      <!-- TODO:#4820 ここに中身を入れる -->
    </template>
  </PrimaryViewSidebarPage>
</template>

<script lang="ts" setup>
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'

import SidebarHeader from './SidebarHeader.vue'

const emit = defineEmits<{
  (e: 'moveBack'): void
}>()
</script>
