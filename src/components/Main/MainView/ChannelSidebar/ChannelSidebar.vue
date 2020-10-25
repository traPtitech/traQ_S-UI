<template>
  <main-view-sidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <main-view-sidebar-page v-if="!state.pinnedMode">
        <template #header>
          <channel-sidebar-header :channel-id="channelId" />
        </template>
        <template #content>
          <channel-sidebar-content
            :channel-id="channelId"
            :viewer-ids="viewerIds"
            :qall-user-ids="qallUserIds"
            :pinned-messages-count="state.pinnedMessages.length"
            @pinned-mode-toggle="togglePinnedMode"
          />
        </template>
      </main-view-sidebar-page>
      <sidebar-pinned-page
        v-else
        :pinned-messages="state.pinnedMessages"
        @toggle="togglePinnedMode"
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
import MainViewSidebarPage from '@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
import ChannelSidebarHeader from './ChannelSidebarHeader.vue'
import ChannelSidebarContent from './ChannelSidebarContent.vue'
import SidebarPinnedPage from '@/components/Main/MainView/MainViewSidebar/SidebarPinnedPage.vue'
import ChannelSidebarHidden from './ChannelSidebarHidden.vue'
import { useQallSession } from './use/channelRTCSession'

export default defineComponent({
  name: 'ChannelSidebar',
  components: {
    MainViewSidebar,
    MainViewSidebarPage,
    SidebarPinnedPage,
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
