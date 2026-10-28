<template>
  <PrimaryViewSidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <PrimaryViewSidebarPage v-if="page === 'default'">
        <template #header>
          <SidebarHeader icon-string="#" :text="channelName" />
        </template>
        <template #content>
          <ChannelInfomationSidebarContent
            v-model:is-viewers-detail-open="isViewersDetailOpen"
            :channel-id="channelId"
            :viewer-ids="activeViewingUsers"
            :inactive-viewer-ids="inactiveViewingUsers"
            :pinned-messages-count="pinnedMessages.length"
            @move-to-pinned="moveToPinnedPage"
            @move-to-events="moveToEventsPage"
          />
        </template>
      </PrimaryViewSidebarPage>
      <InfomationSidebarPinnedPage
        v-else-if="page === 'pinned'"
        :pinned-messages="pinnedMessages"
        @move-back="moveToDefaultPage"
      />
      <InfomationSidebarEventsPage
        v-else-if="page === 'events'"
        :channel-id="channelId"
        @move-back="moveToDefaultPage"
      />
    </template>
    <template #opener>
      <ChannelInfomationSidebarHidden
        :viewer-ids="activeViewingUsers"
        :inactive-viewer-ids="inactiveViewingUsers"
        @open="openSidebar"
        @open-viewers="openViewers"
      />
    </template>
  </PrimaryViewSidebar>
</template>

<script lang="ts" setup>
import type { Pin } from '@traptitech/traq'

import { computed } from 'vue'

import InfomationSidebarEventsPage from '/@/components/Main/MainView/InfomationSidebar/InfomationSidebarEventsPage.vue'
import InfomationSidebarPinnedPage from '/@/components/Main/MainView/InfomationSidebar/InfomationSidebarPinnedPage.vue'
import useChannelInfomationSidebar from '/@/components/Main/MainView/InfomationSidebar/composables/useChannelInfomationSidebar'
import PrimaryViewSidebar from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebar.vue'
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'
import SidebarHeader from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarHeader.vue'
import useToggle from '/@/composables/utils/useToggle'
import { useChannelsStore } from '/@/store/entities/channels'
import type { ChannelId, UserId } from '/@/types/entity-ids'

import ChannelInfomationSidebarContent from './ChannelInfomationSidebarContent.vue'
import ChannelInfomationSidebarHidden from './ChannelInfomationSidebarHidden.vue'

const props = defineProps<{
  channelId: ChannelId
  isSidebarOpenerReady: boolean
  pinnedMessages: Pin[]
  activeViewingUsers: UserId[]
  inactiveViewingUsers: UserId[]
}>()

const { channelsMap } = useChannelsStore()
const {
  page,
  moveToDefaultPage,
  moveToPinnedPage,
  moveToEventsPage,
  openSidebar
} = useChannelInfomationSidebar()

const channelName = computed(
  () => channelsMap.value.get(props.channelId)?.name ?? ''
)

const { value: isViewersDetailOpen, open: openViewersDetail } = useToggle(false)

const openViewers = () => {
  openSidebar()
  openViewersDetail()
}
</script>
