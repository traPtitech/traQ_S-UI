<template>
  <main-view-sidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <main-view-sidebar-page v-if="!state.pinnedMode">
        <template #header>
          <sidebar-header v-if="!state.pinnedMode" :name="userName" />
        </template>
        <template #content>
          <sidebar-content
            :viewer-ids="viewerIds"
            :pinned-messages-count="state.pinnedMessages.length"
            @pinned-mode-toggle="togglePinnedMode"
          />
        </template>
      </main-view-sidebar-page>
      <main-view-sidebar-page v-else>
        <template #header>
          <channel-sidebar-header
            show-back-button
            @back="togglePinnedMode"
            title="ピン留め"
          />
        </template>
        <template #content>
          <!--TODO: チャンネルと共通のコンポーネントを1つ上に持っていく-->
          <channel-sidebar-pinned-list
            v-if="state.pinnedMode"
            :pinned-messages="state.pinnedMessages"
          />
        </template>
      </main-view-sidebar-page>
    </template>
    <template #opener>
      <channel-sidebar-hidden @open="openSidebar" :viewer-ids="viewerIds" />
    </template>
  </main-view-sidebar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useChannelSidebarCommon from '@/components/Main/MainView/use/channelSidebarCommon'
import ChannelSidebarPinnedList from '@/components/Main/MainView/ChannelSidebar/ChannelSidebarPinnedList.vue'
import ChannelSidebarHeader from '@/components/Main/MainView/ChannelSidebar/ChannelSidebarHeader.vue'
import ChannelSidebarHidden from '@/components/Main/MainView/ChannelSidebar/ChannelSidebarHidden.vue'
import MainViewSidebar from '@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import MainViewSidebarPage from '@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
import SidebarHeader from './DMSidebarHeader.vue'
import SidebarContent from './DMSidebarContent.vue'

export default defineComponent({
  name: 'DMSidebar',
  components: {
    MainViewSidebar,
    MainViewSidebarPage,
    ChannelSidebarPinnedList,
    ChannelSidebarHeader,
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
    const {
      state,
      viewerIds,
      togglePinnedMode,
      openSidebar,
      closeSidebar
    } = useChannelSidebarCommon()

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
