<template>
  <main-view-sidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <main-view-sidebar-page v-if="page.type === 'default'">
        <template #header>
          <sidebar-header icon-string="#" :text="channelName" />
        </template>
        <template #content>
          <channel-sidebar-content
            :channel-id="channelId"
            :viewer-ids="viewerIds"
            :pinned-messages-count="pinnedMessages.length"
            @moveToPinned="moveToPinnedPage"
            @moveToEvents="moveToEventsPage"
          />
        </template>
      </main-view-sidebar-page>
      <sidebar-pinned-page
        v-else-if="page.type === 'pinned'"
        :pinned-messages="pinnedMessages"
        @moveBack="moveToDefaultPage"
      />
      <sidebar-events-page
        v-else-if="page.type === 'events'"
        :channel-id="channelId"
        @moveBack="moveToDefaultPage"
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
import SidebarHeader from '@/components/Main/MainView/MainViewSidebar/SidebarHeader.vue'
import store from '@/store'
import SidebarEventsPage from '@/components/Main/MainView/MainViewSidebar/SidebarEventsPage.vue'

export default defineComponent({
  name: 'ChannelSidebar',
  components: {
    MainViewSidebar,
    MainViewSidebarPage,
    SidebarPinnedPage,
    SidebarHeader,
    ChannelSidebarContent,
    ChannelSidebarHidden,
    SidebarEventsPage
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
      () => store.state.entities.channelsMap.get(props.channelId)?.name ?? ''
    )

    return {
      page,
      moveToDefaultPage,
      moveToPinnedPage,
      moveToEventsPage,
      channelName,
      pinnedMessages,
      viewerIds,
      openSidebar,
      closeSidebar
    }
  }
})
</script>
