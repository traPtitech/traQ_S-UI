<template>
  <main-view-sidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <main-view-sidebar-page v-if="!state.pinnedMode">
        <template #header>
          <sidebar-header icon-string="#" :text="channelName" />
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
      <channel-sidebar-hidden :viewer-ids="viewerIds" @open="openSidebar" />
    </template>
  </main-view-sidebar>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ChannelId } from '@/types/entity-ids'
import useChannelSidebarCommon from '@/components/Main/MainView/use/channelSidebarCommon'
import MainViewSidebar from '@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import MainViewSidebarPage from '@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
import ChannelSidebarContent from './ChannelSidebarContent.vue'
import SidebarPinnedPage from '@/components/Main/MainView/MainViewSidebar/SidebarPinnedPage.vue'
import ChannelSidebarHidden from './ChannelSidebarHidden.vue'
import { useQallSession } from './use/channelRTCSession'
import SidebarHeader from '@/components/Main/MainView/MainViewSidebar/SidebarHeader.vue'
import store from '@/store'

export default defineComponent({
  name: 'ChannelSidebar',
  components: {
    MainViewSidebar,
    MainViewSidebarPage,
    SidebarPinnedPage,
    SidebarHeader,
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
    const { state, viewerIds, togglePinnedMode, openSidebar, closeSidebar } =
      useChannelSidebarCommon()

    const channelName = computed(
      () => store.state.entities.channelsMap.get(props.channelId)?.name ?? ''
    )

    const { sessionUserIds: qallUserIds } = useQallSession(props)

    return {
      state,
      togglePinnedMode,
      channelName,
      viewerIds,
      qallUserIds,
      openSidebar,
      closeSidebar
    }
  }
})
</script>
