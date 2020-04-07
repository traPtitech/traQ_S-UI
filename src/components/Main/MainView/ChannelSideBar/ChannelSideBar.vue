<template>
  <channel-side-bar-hidden
    v-if="!state.isOpen"
    @open="toggle"
    :viewersId="viewersId"
  />
  <pinned-side-bar
    v-else-if="state.pinnedMode"
    @closePinned="togglePinnedMode"
    @closeBar="toggle"
    :pinnedMessage="state.pinnedMessage"
  />
  <div v-else :style="styles.container" :class="$style.container">
    <channel-side-bar-header :channel-id="props.channelId" @close="toggle" />
    <channel-side-bar-viewers :viewersId="viewersId" />
    <channel-side-bar-topic />
    <channel-side-bar-pinned
      :pinnedMessageLength="state.pinnedMessage.length"
      @open="togglePinnedMode"
    />
    <channel-side-bar-member />
    <channel-side-bar-edit />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  SetupContext
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
import PinnedSideBar from './PinnedSideBar.vue'

type Props = {
  channelId: ChannelId
}

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
    PinnedSideBar
  },
  props: {
    channelId: { type: String, requried: true }
  },
  setup(props: Props) {
    const state = reactive({
      isOpen: true,
      pinnedMode: false,
      pinnedMessage: computed(
        () => store.state.domain.messagesView.pinnedMessages
      )
    })
    const styles = useStyles()
    // const viewersId = computed(
    //   () => store.getters.domain.messagesView.getCurrentViewersId
    // )
    const viewersId = new Array(10).fill('0853a54a-7102-4d6b-b45e-720c87a26c41')
    const toggle = () => {
      state.isOpen = !state.isOpen
    }
    const togglePinnedMode = () => {
      state.pinnedMode = !state.pinnedMode
    }
    return {
      state,
      props,
      toggle,
      togglePinnedMode,
      viewersId,
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
</style>
