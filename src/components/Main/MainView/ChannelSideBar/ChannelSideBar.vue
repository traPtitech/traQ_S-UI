<template>
  <channel-sidebar-pinned-list
    v-if="state.pinnedMode"
    @closePinned="togglePinnedMode"
    @closeBar="closeSidebar"
    :pinned-message="state.pinnedMessage"
  />
  <main-view-sidebar v-else :style="styles.container" :class="$style.container">
    <template #header>
      <channel-sidebar-header
        :channel-id="channelId"
        @close="closeSidebar"
        :class="$style.sidebarItem"
      />
    </template>
    <template #content>
      <channel-sidebar-viewers
        :viewer-ids="viewerIds"
        :class="$style.sidebarItem"
      />
      <channel-sidebar-topic :class="$style.sidebarItem" />
      <channel-sidebar-pinned
        :pinned-message-length="state.pinnedMessage.length"
        @open="togglePinnedMode"
        :class="$style.sidebarItem"
      />
      <channel-sidebar-relation
        :channel-id="channelId"
        :class="$style.sidebarItem"
      />
      <channel-sidebar-member
        :channel-id="channelId"
        :class="$style.sidebarItem"
        :viewer-ids="viewerIds"
      />
      <channel-sidebar-edit :class="$style.edit" />
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
import ChannelSidebarTopic from './ChannelSidebarTopic.vue'
import ChannelSidebarPinned from './ChannelSidebarPinned.vue'
import ChannelSidebarViewers from './ChannelSidebarViewers.vue'
import ChannelSidebarHeader from './ChannelSidebarHeader.vue'
import ChannelSidebarMember from './ChannelSidebarMember.vue'
import ChannelSidebarEdit from './ChannelSidebarEdit.vue'
import ChannelSidebarHidden from './ChannelSidebarHidden.vue'
import ChannelSidebarPinnedList from './ChannelSidebarPinnedList.vue'
import ChannelSidebarRelation from './ChannelSidebarRelation.vue'

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
    ChannelSidebarTopic,
    ChannelSidebarPinned,
    ChannelSidebarViewers,
    ChannelSidebarHeader,
    ChannelSidebarMember,
    ChannelSidebarEdit,
    ChannelSidebarHidden,
    ChannelSidebarPinnedList,
    ChannelSidebarRelation
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
  margin-top: 16px;
}

.edit {
  margin: 24px 0;
  flex: 1;
  align-items: flex-end;
}
</style>
