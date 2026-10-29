<template>
  <PrimaryViewSidebarPage :show-close-button="false">
    <template #header>
      <SidebarHeader text="スレッド" />
    </template>
    <template #content>
      <ChannelThreadsSidebarContent />
    </template>
  </PrimaryViewSidebarPage>
</template>

<script lang="ts" setup>
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'
import SidebarHeader from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarHeader.vue'

import ChannelThreadsSidebarContent from './ChannelThreadsSidebarContent.vue'
</script>
