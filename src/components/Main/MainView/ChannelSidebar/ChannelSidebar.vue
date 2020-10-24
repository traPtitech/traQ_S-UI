<template>
  <main-view-sidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #header>
      <channel-sidebar-header
        v-if="!state.pinnedMode"
        :channel-id="channelId"
      />
      <channel-sidebar-header
        v-else
        show-back-button
        @back="togglePinnedMode"
        title="ピン留め"
      />
    </template>
    <template #content>
      <channel-sidebar-pinned-list
        v-if="state.pinnedMode"
        :pinned-messages="state.pinnedMessages"
      />
      <channel-sidebar-content
        v-else
        :channel-id="channelId"
        :viewer-ids="viewerIds"
        :qall-user-ids="qallUserIds"
        :pinned-messages-count="state.pinnedMessages.length"
        @pinned-mode-toggle="togglePinnedMode"
      />
    </template>
    <template #opener>
      <channel-sidebar-hidden @open="openSidebar" :viewer-ids="viewerIds" />
    </template>
  </main-view-sidebar>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ChannelId } from '@/types/entity-ids'
import useChannelSidebarCommon from '@/components/Main/MainView/use/channelSidebarCommon'
import MainViewSidebar from '@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import ChannelSidebarHeader from './ChannelSidebarHeader.vue'
import ChannelSidebarContent from './ChannelSidebarContent.vue'
import ChannelSidebarPinnedList from './ChannelSidebarPinnedList.vue'
import ChannelSidebarHidden from './ChannelSidebarHidden.vue'
import { useQallSession } from './use/channelRTCSession'

export default defineComponent({
  name: 'ChannelSidebar',
  components: {
    MainViewSidebar,
    ChannelSidebarPinnedList,
    ChannelSidebarHeader,
    ChannelSidebarContent,
    ChannelSidebarHidden
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    },
    isSidebarOpenerReady: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const {
      state,
      viewerIds,
      togglePinnedMode,
      openSidebar,
      closeSidebar
    } = useChannelSidebarCommon()

    const { sessionUserIds: qallUserIds } = useQallSession(props)

    return {
      state,
      togglePinnedMode,
      viewerIds,
      qallUserIds,
      openSidebar,
      closeSidebar
    }
  }
})
</script>
