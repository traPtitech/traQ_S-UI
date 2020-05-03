<template>
  <main-view-sidebar :style="styles.container" :class="$style.container">
    <template #header>
      <channel-sidebar-header
        v-if="!state.pinnedMode"
        :channel-id="channelId"
        :class="$style.sidebarItem"
      />
      <channel-sidebar-header
        v-else
        show-back-button
        @back="togglePinnedMode"
        title="ピン留め"
        :class="$style.sidebarItem"
      />
    </template>
    <template #content>
      <channel-sidebar-pinned-list
        v-if="state.pinnedMode"
        :pinned-message="state.pinnedMessage"
      />
      <channel-sidebar-content
        v-else
        :channel-id="channelId"
        :viewer-ids="viewerIds"
        :qall-user-ids="qallUserIds"
        :pinned-messages-count="state.pinnedMessage.length"
        @pinned-mode-toggle="togglePinnedMode"
      />
    </template>
  </main-view-sidebar>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import useChannelSidebarCommon from '@/components/Main/MainView/use/channelSidebarCommon'
import MainViewSidebar from '@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import ChannelSidebarHeader from './ChannelSidebarHeader.vue'
import ChannelSidebarContent from './ChannelSidebarContent.vue'
import ChannelSidebarPinnedList from './ChannelSidebarPinnedList.vue'
import { useQallSession } from './use/channelRTCSession'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSidebar',
  components: {
    MainViewSidebar,
    ChannelSidebarPinnedList,
    ChannelSidebarHeader,
    ChannelSidebarContent
  },
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true }
  },
  setup(props) {
    const styles = useStyles()
    const {
      state,
      viewerIds,
      togglePinnedMode,
      closeSidebar
    } = useChannelSidebarCommon()

    const { sessionUserIds: qallUserIds } = useQallSession(props)

    return {
      state,
      togglePinnedMode,
      viewerIds,
      qallUserIds,
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
