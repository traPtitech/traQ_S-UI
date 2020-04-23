<template>
  <channel-side-bar-pinned-list
    v-if="state.pinnedMode"
    @closePinned="togglePinnedMode"
    @closeBar="closeSidebar"
    :pinned-message="state.pinnedMessage"
  />
  <main-view-sidebar v-else :style="styles.container" :class="$style.container">
    <template #header>
      <channel-side-bar-header
        :channel-id="channelId"
        @close="closeSidebar"
        :class="$style.sidebarItem"
      />
    </template>
    <template #content>
      <channel-side-bar-viewers
        :viewer-ids="viewerIds"
        :class="$style.sidebarItem"
      />
      <channel-side-bar-topic :class="$style.sidebarItem" />
      <channel-side-bar-pinned
        :pinned-message-length="state.pinnedMessage.length"
        @open="togglePinnedMode"
        :class="$style.sidebarItem"
      />
      <channel-side-bar-relation
        :channel-id="channelId"
        :class="$style.sidebarItem"
      />
      <channel-side-bar-member
        :channel-id="channelId"
        :class="$style.sidebarItem"
        :viewer-ids="viewerIds"
      />
      <channel-side-bar-edit :class="$style.edit" />
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
import ChannelSideBarTopic from './ChannelSideBarTopic.vue'
import ChannelSideBarPinned from './ChannelSideBarPinned.vue'
import ChannelSideBarViewers from './ChannelSideBarViewers.vue'
import ChannelSideBarHeader from './ChannelSideBarHeader.vue'
import ChannelSideBarMember from './ChannelSideBarMember.vue'
import ChannelSideBarEdit from './ChannelSideBarEdit.vue'
import ChannelSideBarHidden from './ChannelSideBarHidden.vue'
import ChannelSideBarPinnedList from './ChannelSideBarPinnedList.vue'
import ChannelSideBarRelation from './ChannelSideBarRelation.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBar',
  components: {
    MainViewSidebar,
    ChannelSideBarTopic,
    ChannelSideBarPinned,
    ChannelSideBarViewers,
    ChannelSideBarHeader,
    ChannelSideBarMember,
    ChannelSideBarEdit,
    ChannelSideBarHidden,
    ChannelSideBarPinnedList,
    ChannelSideBarRelation
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
