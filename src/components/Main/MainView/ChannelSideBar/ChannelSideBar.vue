<template>
  <div v-if="state.isOpen" :class="$style.container" :style="styles.container">
    <channel-side-bar-header :channel-id="props.channelId" @close="close" />
    <channel-side-bar-viewers />
    <channel-side-bar-topic />
    <channel-side-bar-pinned />
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
import ChannelSideBarTopic from './ChannelSideBarTopic.vue'
import ChannelSideBarPinned from './ChannelSideBarPinned.vue'
import ChannelSideBarViewers from './ChannelSideBarViewers.vue'
import ChannelSideBarHeader from './ChannelSideBarHeader.vue'
import ChannelSideBarMember from './ChannelSideBarMember.vue'
import ChannelSideBarEdit from './ChannelSideBarEdit.vue'

type Props = {
  channelId: ChannelId
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.primary
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
    ChannelSideBarEdit
  },
  props: {
    channelId: { type: String, requried: true }
  },
  setup(props: Props) {
    const styles = useStyles()
    const state = reactive({
      isOpen: true
    })
    const close = () => {
      state.isOpen = !state.isOpen
    }
    return {
      styles,
      state,
      props,
      close
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
  overflow: scroll;
  align-items: center;
}
</style>
