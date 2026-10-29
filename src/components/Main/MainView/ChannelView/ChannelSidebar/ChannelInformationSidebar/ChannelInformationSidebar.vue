<template>
  <PrimaryViewSidebarPage v-if="page === 'default'" :show-close-button="false">
    <template #header>
      <SidebarHeader icon-string="#" :text="channelName" />
    </template>
    <template #content>
      <ChannelInformationSidebarContent
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
  <InformationSidebarPinnedPage
    v-else-if="page === 'pinned'"
    :show-close-button="false"
    :pinned-messages="pinnedMessages"
    @move-back="moveToDefaultPage"
  />
  <InformationSidebarEventsPage
    v-else-if="page === 'events'"
    :show-close-button="false"
    :channel-id="channelId"
    @move-back="moveToDefaultPage"
  />
</template>
<script lang="ts" setup>
import type { Pin } from '@traptitech/traq'

import { computed } from 'vue'

import InformationSidebarEventsPage from '/@/components/Main/MainView/InformationSidebar/InformationSidebarEventsPage.vue'
import InformationSidebarPinnedPage from '/@/components/Main/MainView/InformationSidebar/InformationSidebarPinnedPage.vue'
import useChannelInformationSidebar from '/@/components/Main/MainView/InformationSidebar/composables/useChannelInformationSidebar'
import PrimaryViewSidebarPage from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarPage.vue'
import SidebarHeader from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarHeader.vue'
import { useChannelsStore } from '/@/store/entities/channels'
import type { ChannelId, UserId } from '/@/types/entity-ids'

import ChannelInformationSidebarContent from './ChannelInformationSidebarContent.vue'

const props = defineProps<{
  channelId: ChannelId
  pinnedMessages: Pin[]
  activeViewingUsers: UserId[]
  inactiveViewingUsers: UserId[]
}>()

const { channelsMap } = useChannelsStore()
const { page, moveToDefaultPage, moveToPinnedPage, moveToEventsPage } =
  useChannelInformationSidebar()

const channelName = computed(
  () => channelsMap.value.get(props.channelId)?.name ?? ''
)

const isViewersDetailOpen = defineModel<boolean>('isViewersDetailOpen', {
  required: true
})
</script>
