<template>
  <main-view-sidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <main-view-sidebar-page v-if="page.type === 'default'">
        <template #header>
          <sidebar-header icon-string="@" :text="userName" />
        </template>
        <template #content>
          <sidebar-content
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
import { defineComponent, PropType } from 'vue'
import useChannelSidebarCommon from '@/components/Main/MainView/use/channelSidebarCommon'
import ChannelSidebarHidden from '@/components/Main/MainView/ChannelSidebar/ChannelSidebarHidden.vue'
import MainViewSidebar from '@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import MainViewSidebarPage from '@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
import SidebarPinnedPage from '@/components/Main/MainView/MainViewSidebar/SidebarPinnedPage.vue'
import SidebarHeader from '@/components/Main/MainView/MainViewSidebar/SidebarHeader.vue'
import SidebarContent from './DMSidebarContent.vue'
import SidebarEventsPage from '@/components/Main/MainView/MainViewSidebar/SidebarEventsPage.vue'
import { ChannelId } from '@/types/entity-ids'

export default defineComponent({
  name: 'DMSidebar',
  components: {
    MainViewSidebar,
    MainViewSidebarPage,
    SidebarPinnedPage,
    ChannelSidebarHidden,
    SidebarHeader,
    SidebarContent,
    SidebarEventsPage
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    },
    userName: {
      type: String,
      requried: true
    },
    isSidebarOpenerReady: {
      type: Boolean,
      required: true
    }
  },
  setup() {
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

    return {
      page,
      moveToDefaultPage,
      moveToPinnedPage,
      moveToEventsPage,
      pinnedMessages,
      viewerIds,
      openSidebar,
      closeSidebar
    }
  }
})
</script>
