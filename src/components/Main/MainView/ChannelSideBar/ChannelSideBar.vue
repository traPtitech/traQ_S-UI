<template>
  <div :class="$style.container" :style="styles.container">
    <h2>
      <channel-side-bar-header :channel-id="state.channelId" />
    </h2>
    <channel-side-bar-viewers />
    <channel-side-bar-topic />
    <channel-side-bar-pinned />
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
    ChannelSideBarHeader
  },
  setup(props: Props, _: SetupContext) {
    const styles = useStyles()
    const state = reactive({
      channelId: computed(
        () => store.state.domain.messagesView.currentChannelId
      )
    })
    return {
      styles,
      state,
      props
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  flex: 0 0 320px;
  position: static;
  height: 100%;
}
</style>
