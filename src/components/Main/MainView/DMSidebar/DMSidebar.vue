<template>
  <main-view-sidebar :style="styles.container" :class="$style.container">
    <template #header>
      <sidebar-header v-if="!state.pinnedMode" :name="userName" />
      <!--TODO: これはチャンネル関係ないので切り出し-->
      <channel-sidebar-header
        v-else
        show-back-button
        @back="togglePinnedMode"
        title="ピン留め"
        :class="$style.sidebarItem"
      />
    </template>
    <template #content>
      <!--TODO: チャンネルと共通のコンポーネントを1つ上に持っていく-->
      <channel-sidebar-pinned-list
        v-if="state.pinnedMode"
        :pinned-message="state.pinnedMessage"
      />
      <sidebar-content
        v-else
        :viewer-ids="viewerIds"
        :pinned-messages-count="state.pinnedMessage.length"
        @pinned-mode-toggle="togglePinnedMode"
      />
    </template>
  </main-view-sidebar>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useChannelSidebarCommon from '@/components/Main/MainView/use/channelSidebarCommon'
import ChannelSidebarPinnedList from '@/components/Main/MainView/ChannelSidebar/ChannelSidebarPinnedList.vue'
import ChannelSidebarHeader from '@/components/Main/MainView/ChannelSidebar/ChannelSidebarHeader.vue'
import MainViewSidebar from '@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import SidebarHeader from './DMSidebarHeader.vue'
import SidebarContent from './DMSidebarContent.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'DMSidebar',
  components: {
    MainViewSidebar,
    ChannelSidebarPinnedList,
    ChannelSidebarHeader,
    SidebarHeader,
    SidebarContent
  },
  props: {
    userName: { type: String, requried: true }
  },
  setup() {
    const styles = useStyles()
    const {
      state,
      viewerIds,
      togglePinnedMode,
      closeSidebar
    } = useChannelSidebarCommon()

    return {
      state,
      togglePinnedMode,
      viewerIds,
      styles,
      closeSidebar
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  width: 320px;
  height: 100%;
  padding: 0 32px;
  overflow: auto;
}
.sidebarItem {
  margin: 16px 0;
}
</style>
