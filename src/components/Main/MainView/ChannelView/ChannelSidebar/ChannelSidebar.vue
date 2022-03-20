<template>
  <primary-view-sidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <primary-view-sidebar-page v-if="page === 'default'">
        <template #header>
          <sidebar-header icon-string="#" :text="channelName" />
        </template>
        <template #content>
          <channel-sidebar-content
            :channel-id="channelId"
            :viewer-ids="viewerIds"
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
      <channel-sidebar-hidden :viewer-ids="viewerIds" @open="openSidebar" />
    </template>
  </primary-view-sidebar>
</template>

<script lang="ts" setup>
import PrimaryViewSidebar from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebar.vue'
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'
import ChannelSidebarContent from './ChannelSidebarContent.vue'
import SidebarPinnedPage from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarPinnedPage.vue'
import ChannelSidebarHidden from './ChannelSidebarHidden.vue'
import SidebarHeader from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarHeader.vue'
import SidebarEventsPage from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarEventsPage.vue'
import { computed } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import useChannelSidebarCommon from '/@/components/Main/MainView/composables/useChannelSidebarCommon'
import { useChannelsStore } from '/@/store/entities/channels'

const props = defineProps<{
  channelId: ChannelId
  isSidebarOpenerReady: boolean
}>()

const { channelsMap } = useChannelsStore()
const {
  page,
  moveToDefaultPage,
  moveToPinnedPage,
  moveToEventsPage,
  pinnedMessages,
  viewerIds,
  openSidebar,
  closeSidebar
} = useChannelSidebarCommon()

const channelName = computed(
  () => channelsMap.value.get(props.channelId)?.name ?? ''
)
</script>