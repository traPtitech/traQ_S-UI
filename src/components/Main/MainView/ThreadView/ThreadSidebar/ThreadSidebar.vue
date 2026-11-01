<template>
  <PrimaryViewSidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <PrimaryViewSidebarPage v-if="page === 'default'">
        <template #header>
          <SidebarHeader icon-string="#" :text="channelName" />
        </template>
        <template #content>
          <ThreadSidebarContent
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
      <ThreadSidebarHidden
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

import SidebarEventsPage from '/@/components/Main/MainView/InformationSidebar/InformationSidebarEventsPage.vue'
import SidebarPinnedPage from '/@/components/Main/MainView/InformationSidebar/InformationSidebarPinnedPage.vue'
import useThreadSidebarCommon from '/@/components/Main/MainView/InformationSidebar/composables/useChannelInformationSidebar'
import PrimaryViewSidebar from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebar.vue'
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'
import SidebarHeader from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarHeader.vue'
import useChannelPath from '/@/composables/useChannelPath'
import useToggle from '/@/composables/utils/useToggle'
import type { ChannelId, UserId } from '/@/types/entity-ids'

import ThreadSidebarContent from './ThreadSidebarContent.vue'
import ThreadSidebarHidden from './ThreadSidebarHidden.vue'

const props = defineProps<{
  channelId: ChannelId
  isSidebarOpenerReady: boolean
  pinnedMessages: Pin[]
  activeViewingUsers: UserId[]
  inactiveViewingUsers: UserId[]
}>()

const { channelIdToPath } = useChannelPath()
const {
  page,
  moveToDefaultPage,
  moveToPinnedPage,
  moveToEventsPage,
  openSidebar
} = useThreadSidebarCommon()

const channelName = computed(
  () => channelIdToPath(props.channelId)?.at(-1) ?? ''
)

const { value: isViewersDetailOpen, open: openViewersDetail } = useToggle(false)

const openViewers = () => {
  openSidebar()
  openViewersDetail()
}
</script>
