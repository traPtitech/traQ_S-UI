<template>
  <PrimaryViewSidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <PrimaryViewSidebarPage v-if="page === 'default'">
        <template #header>
          <SidebarHeader icon-string="#" :text="channelName" />
        </template>
        <template #content>
          <ChannelSidebarContent
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
      <SidebarPinnedPage
        v-else-if="page === 'pinned'"
        :pinned-messages="pinnedMessages"
        @move-back="moveToDefaultPage"
      />
      <SidebarEventsPage
        v-else-if="page === 'events'"
        :channel-id="channelId"
        @move-back="moveToDefaultPage"
      />
    </template>
    <template #opener>
      <ChannelSidebarHidden
        :viewer-ids="activeViewingUsers"
        :inactive-viewer-ids="inactiveViewingUsers"
        @open="openSidebar"
        @open-viewers="openViewers"
      />
    </template>
  </PrimaryViewSidebar>
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
import type { ChannelId, UserId } from '/@/types/entity-ids'
import useChannelSidebarCommon from '/@/components/Main/MainView/composables/useChannelSidebarCommon'
import { useChannelsStore } from '/@/store/entities/channels'
import useToggle from '/@/composables/utils/useToggle'
import type { Pin } from '@traptitech/traq'

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
} = useChannelSidebarCommon()

const channelName = computed(
  () => channelsMap.value.get(props.channelId)?.name ?? ''
)

const { value: isViewersDetailOpen, open: openViewersDetail } = useToggle(false)

const openViewers = () => {
  openSidebar()
  openViewersDetail()
}
</script>
