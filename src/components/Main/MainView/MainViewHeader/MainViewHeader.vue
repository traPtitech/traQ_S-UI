<template>
  <header :class="$style.container" :style="styles.container">
    <h2>
      <main-view-header-channel-name :channel-id="props.channelId" />
    </h2>
    <main-view-header-tools
      :class="$style.tools"
      :is-stared="channelState.stared"
      @star-channel="starChannel"
      @unstar-channel="unstarChannel"
      @click-notification="openNotificationModal"
    />
  </header>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import MainViewHeaderChannelName from './MainViewHeaderChannelName.vue'
import MainViewHeaderTools from './MainViewHeaderTools.vue'

type Props = {
  channelId: ChannelId
}

const useChannelState = (props: Props) => {
  const state = reactive({
    stared: computed(
      () => props.channelId in store.state.domain.me.staredChannelSet
    )
  })
  return { channelState: state }
}

const useStarChannel = (props: Props) => {
  const starChannel = () => {
    store.dispatch.domain.me.starChannel(props.channelId)
  }
  const unstarChannel = () => {
    store.dispatch.domain.me.unstarChannel(props.channelId)
  }
  return { starChannel, unstarChannel }
}

const useNotificationModal = (props: Props) => {
  const openNotificationModal = () => {
    store.dispatch.ui.modal.pushModal({
      type: 'notification',
      channelId: props.channelId
    })
  }
  return { openNotificationModal }
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary,
      borderBottom: `2px solid ${theme.ui.tertiary}`
    }))
  })

export default defineComponent({
  name: 'MainViewHeader',
  components: {
    MainViewHeaderChannelName,
    MainViewHeaderTools
  },
  props: { channelId: String },
  setup(props: Props) {
    const { channelState } = useChannelState(props)
    const { starChannel, unstarChannel } = useStarChannel(props)
    const { openNotificationModal } = useNotificationModal(props)
    const styles = useStyles()
    return {
      props,
      channelState,
      styles,
      starChannel,
      unstarChannel,
      openNotificationModal
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 16px;
}
.tools {
  flex-shrink: 0;
}
</style>
