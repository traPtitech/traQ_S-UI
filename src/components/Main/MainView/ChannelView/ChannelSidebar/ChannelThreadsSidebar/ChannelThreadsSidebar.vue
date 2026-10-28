<template>
  <PrimaryViewSidebarPage v-if="page === 'default'" :show-close-button="false">
    <template #header>
      <SidebarHeader text="スレッド" />
    </template>
    <template #content>
      <ChannelThreadsSidebarContent
        default-notification=""
        @move-to-notification="moveToNotificationPage"
      />
    </template>
  </PrimaryViewSidebarPage>
  <ThreadsSidebarNotificationPage
    v-else-if="page === 'notification'"
    default-notification=""
    :show-close-button="false"
    @move-back="moveToDefaultPage"
  />
</template>

<script lang="ts" setup>
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'
import SidebarHeader from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarHeader.vue'
import ThreadsSidebarNotificationPage from '/@/components/Main/MainView/ThreadsSidebar/ThreadsSidebarNotificationPage.vue'
import useChannelThreadsSidebar from '/@/components/Main/MainView/ThreadsSidebar/composables/useThreadsSidebar'

import ChannelThreadsSidebarContent from './ChannelThreadsSidebarContent.vue'

const { page, moveToDefaultPage, moveToNotificationPage } =
  useChannelThreadsSidebar()
</script>
