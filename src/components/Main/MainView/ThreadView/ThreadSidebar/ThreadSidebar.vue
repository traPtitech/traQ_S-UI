<template>
  <PrimaryViewSidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <PrimaryViewSidebarPage
        v-if="page === 'default'"
        :show-close-button="false"
      >
        <template #header>
          <SidebarHeader
            icon-name="comment-outline"
            icon-mdi
            :text="channelName"
            :class="$style.title"
          />
          <button
            type="button"
            aria-label="サイドバーを閉じる"
            :class="$style.close"
            @click="closeSidebar"
          >
            <AIcon name="close" mdi :size="24" />
          </button>
        </template>
        <template #content>
          <ThreadSidebarContent
            :key="channelId"
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
import type { Pin } from '@traptitech/traq'

import { computed, watch } from 'vue'

import ChannelSidebarHidden from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelSidebarHidden.vue'
import SidebarEventsPage from '/@/components/Main/MainView/InformationSidebar/InformationSidebarEventsPage.vue'
import SidebarPinnedPage from '/@/components/Main/MainView/InformationSidebar/InformationSidebarPinnedPage.vue'
import useChannelInformationSidebar from '/@/components/Main/MainView/InformationSidebar/composables/useChannelInformationSidebar'
import PrimaryViewSidebar from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebar.vue'
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'
import SidebarHeader from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarHeader.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import useChannelPath from '/@/composables/useChannelPath'
import useToggle from '/@/composables/utils/useToggle'
import type { ChannelId, UserId } from '/@/types/entity-ids'

import ThreadSidebarContent from './ThreadSidebarContent.vue'

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
  openSidebar,
  closeSidebar
} = useChannelInformationSidebar()

const channelName = computed(
  () => channelIdToPath(props.channelId)?.at(-1) ?? ''
)

const { value: isViewersDetailOpen, open: openViewersDetail } = useToggle(false)

watch(
  () => props.channelId,
  () => {
    moveToDefaultPage()
    isViewersDetailOpen.value = false
  }
)

const openViewers = () => {
  openSidebar()
  openViewersDetail()
}
</script>

<style lang="scss" module>
.title {
  font-weight: bold;
  :global(svg) {
    transform: scaleX(-1);
  }
}
.close {
  @include color-ui-primary;
  display: flex;
  flex-shrink: 0;
  margin-left: 8px;
  cursor: pointer;
  &:focus-visible {
    outline: 2px solid $theme-accent-focus-default;
  }
}
</style>
