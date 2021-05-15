<template>
  <main-view-sidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <main-view-sidebar-page v-if="!state.pinnedMode">
        <template #header>
          <sidebar-header icon-string="@" :text="userName" />
        </template>
        <template #content>
          <sidebar-content
            :viewer-ids="viewerIds"
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
import { defineComponent } from 'vue'
import useChannelSidebarCommon from '@/components/Main/MainView/use/channelSidebarCommon'
import ChannelSidebarHidden from '@/components/Main/MainView/ChannelSidebar/ChannelSidebarHidden.vue'
import MainViewSidebar from '@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import MainViewSidebarPage from '@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
import SidebarPinnedPage from '@/components/Main/MainView/MainViewSidebar/SidebarPinnedPage.vue'
import SidebarHeader from '@/components/Main/MainView/MainViewSidebar/SidebarHeader.vue'
import SidebarContent from './DMSidebarContent.vue'

export default defineComponent({
  name: 'DMSidebar',
  components: {
    MainViewSidebar,
    MainViewSidebarPage,
    SidebarPinnedPage,
    ChannelSidebarHidden,
    SidebarHeader,
    SidebarContent
  },
  props: {
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
    const { state, viewerIds, togglePinnedMode, openSidebar, closeSidebar } =
      useChannelSidebarCommon()

    return {
      state,
      togglePinnedMode,
      viewerIds,
      openSidebar,
      closeSidebar
    }
  }
})
</script>
