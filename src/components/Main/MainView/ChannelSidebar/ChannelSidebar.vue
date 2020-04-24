<template>
  <main-view-sidebar :style="styles.container" :class="$style.container">
    <template #header>
      <!--TODO: ヘッダのコンポーネント分離-->
      <channel-sidebar-header
        v-if="!state.pinnedMode"
        :channel-id="channelId"
        @close="closeSidebar"
        :class="$style.sidebarItem"
      />
    </template>
    <template #content>
      <channel-sidebar-pinned-list
        v-if="state.pinnedMode"
        @closePinned="togglePinnedMode"
        @closeBar="closeSidebar"
        :pinned-message="state.pinnedMessage"
      />
      <channel-sidebar-content
        v-else
        :channel-id="channelId"
        :viewer-ids="viewerIds"
        :pinned-messages-count="state.pinnedMessage.length"
        @pinned-mode-toggle="togglePinnedMode"
      />
    </template>
  </main-view-sidebar>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useSidebar from '@/use/sidebar'
import MainViewSidebar from '@/components/Main/MainView/MainViewSidebar/MainViewSidebar.vue'
import ChannelSidebarHeader from './ChannelSidebarHeader.vue'
import ChannelSidebarContent from './ChannelSidebarContent.vue'
import ChannelSidebarPinnedList from './ChannelSidebarPinnedList.vue'

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
    channelId: { type: String as PropType<ChannelId>, requried: true }
  },
  setup() {
    const state = reactive({
      pinnedMode: false,
      pinnedMessage: computed(
        () => store.state.domain.messagesView.pinnedMessages
      )
    })
    const styles = useStyles()
    const viewerIds = computed(
      () => store.getters.domain.messagesView.viewingUsers
    )
    const togglePinnedMode = () => {
      state.pinnedMode = !state.pinnedMode
    }
    const { closeSidebar } = useSidebar()

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
