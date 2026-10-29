<template>
  <PrimaryViewSidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <div :class="$style.panel">
        <ChannelSidebarControls v-model="sidebarMode" @close="closeSidebar" />
        <ChannelInformationSidebar
          v-if="sidebarMode === 'information'"
          v-model:is-viewers-detail-open="isViewersDetailOpen"
          :channel-id="channelId"
          :pinned-messages="pinnedMessages"
          :active-viewing-users="activeViewingUsers"
          :inactive-viewing-users="inactiveViewingUsers"
        />
        <ChannelThreadsSidebar v-else :channel-id="channelId" />
      </div>
    </template>
    <template #opener>
      <ChannelInformationSidebarHidden
        v-if="sidebarMode === 'information'"
        :viewer-ids="activeViewingUsers"
        :inactive-viewer-ids="inactiveViewingUsers"
        @open="openSidebar"
        @open-viewers="openInformationViewers"
      />
      <PrimaryViewSidebarHidden v-else @open="openSidebar" />
    </template>
  </PrimaryViewSidebar>
</template>

<script lang="ts" setup>
import type { Pin } from '@traptitech/traq'

import { ref } from 'vue'

import PrimaryViewSidebar from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebar.vue'
import PrimaryViewSidebarHidden from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarHidden.vue'
import useSidebar from '/@/composables/mainView/useSidebar'
import type { ChannelId, UserId } from '/@/types/entity-ids'

import ChannelInformationSidebar from './ChannelInformationSidebar/ChannelInformationSidebar.vue'
import ChannelInformationSidebarHidden from './ChannelInformationSidebar/ChannelInformationSidebarHidden.vue'
import ChannelSidebarControls from './ChannelSidebarControls.vue'
import ChannelThreadsSidebar from './ChannelThreadsSidebar/ChannelThreadsSidebar.vue'

defineProps<{
  channelId: ChannelId
  isSidebarOpenerReady: boolean
  pinnedMessages: Pin[]
  activeViewingUsers: UserId[]
  inactiveViewingUsers: UserId[]
}>()

const sidebarMode = ref<'information' | 'threads'>('information')
const isViewersDetailOpen = ref(false)
const { openSidebar, closeSidebar } = useSidebar()

const openInformationViewers = () => {
  sidebarMode.value = 'information'
  isViewersDetailOpen.value = true
  openSidebar()
}
</script>

<style lang="scss" module>
.panel {
  position: relative;
  height: 100%;
}

// The mobile drawer clips content outside its 320px width.
[data-is-mobile] {
  .panel {
    padding-top: 56px;
  }
}
</style>
