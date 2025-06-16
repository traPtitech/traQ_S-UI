<template>
  <primary-view-sidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <primary-view-sidebar-page v-if="page === 'default'">
        <template #header>
          <sidebar-header icon-string="@" :text="userName" />
        </template>
        <template #content>
          <sidebar-content
            :viewer-ids="activeViewingUsers"
            :inactive-viewer-ids="inactiveViewingUsers"
            :pinned-messages-count="pinnedMessages.length"
            @move-to-pinned="moveToPinnedPage"
            @move-to-events="moveToEventsPage"
          />
        </template>
      </primary-view-sidebar-page>
      <sidebar-pinned-page
        v-else-if="page === 'pinned'"
        :pinned-messages="pinnedMessages"
        @move-back="moveToDefaultPage"
      />
      <sidebar-events-page
        v-else-if="page === 'events'"
        :channel-id="channelId"
        @move-back="moveToDefaultPage"
      />
    </template>
    <template #opener>
      <channel-sidebar-hidden
        :viewer-ids="activeViewingUsers"
        :inactive-viewer-ids="inactiveViewingUsers"
        @open="openSidebar"
      />
    </template>
  </primary-view-sidebar>
</template>

<script lang="ts" setup>
import ChannelSidebarHidden from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelSidebarHidden.vue'
import PrimaryViewSidebar from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebar.vue'
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'
import SidebarPinnedPage from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarPinnedPage.vue'
import SidebarHeader from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarHeader.vue'
import SidebarContent from './DMSidebarContent.vue'
import SidebarEventsPage from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarEventsPage.vue'
import useChannelSidebarCommon from '/@/components/Main/MainView/composables/useChannelSidebarCommon'
import type { ChannelId, UserId } from '/@/types/entity-ids'
import type { Pin } from '@traptitech/traq'

defineProps<{
  channelId: ChannelId
  userName: string
  isSidebarOpenerReady: boolean
  pinnedMessages: Pin[]
  activeViewingUsers: UserId[]
  inactiveViewingUsers: UserId[]
}>()

const {
  page,
  moveToDefaultPage,
  moveToPinnedPage,
  moveToEventsPage,
  openSidebar
} = useChannelSidebarCommon()
</script>
