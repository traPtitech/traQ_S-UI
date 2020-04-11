<template>
  <channel-side-bar-hidden
    v-if="!state.isOpen"
    @open="toggle"
    :viewerIds="viewerIds"
  />
  <channel-side-bar-pinned-list
    v-else-if="state.pinnedMode"
    @closePinned="togglePinnedMode"
    @closeBar="toggle"
    :pinnedMessage="state.pinnedMessage"
  />
  <div v-else :style="styles.container" :class="$style.container">
    <channel-side-bar-header
      :channel-id="channelId"
      @close="toggle"
      :class="$style.sidebarItem"
    />
    <channel-side-bar-viewers
      :viewerIds="viewerIds"
      :class="$style.sidebarItem"
    />
    <channel-side-bar-topic :class="$style.sidebarItem" />
    <channel-side-bar-pinned
      :pinnedMessageLength="state.pinnedMessage.length"
      @open="togglePinnedMode"
      :class="$style.sidebarItem"
    />
    <channel-side-bar-relation
      :channelId="channelId"
      :class="$style.sidebarItem"
    />
    <channel-side-bar-member
      :channelId="channelId"
      :class="$style.sidebarItem"
      :viewerIds="viewerIds"
    />
    <channel-side-bar-edit :class="$style.edit" />
  </div>
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
import { ChannelViewState } from '@traptitech/traq'
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
      isOpen: true,
      pinnedMode: false,
      pinnedMessage: computed(
        () => store.state.domain.messagesView.pinnedMessages
      )
    })
    const styles = useStyles()
    const viewerIds = computed(
      () => store.getters.domain.messagesView.getCurrentViewersId
    )
    const toggle = () => {
      state.isOpen = !state.isOpen
    }
    const togglePinnedMode = () => {
      state.pinnedMode = !state.pinnedMode
    }
    return {
      state,
      toggle,
      togglePinnedMode,
      viewerIds,
      styles
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
  margin-top: auto;
  margin-bottom: 24px;
}
</style>
