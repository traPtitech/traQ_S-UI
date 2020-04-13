<template>
  <header :class="$style.container" :style="styles.container">
    <h2>
      <main-view-header-channel-name :channel-id="channelId" />
    </h2>
    <main-view-header-tools
      :class="$style.tools"
      :is-stared="channelState.stared"
      @star-channel="starChannel"
      @unstar-channel="unstarChannel"
      @click-more="togglePopupMenu"
    />
    <portal v-if="isPopupMenuShown" :to="targetPortalName">
      <main-view-header-tools-menu
        :class="$style.toolsMenu"
        v-click-outside="closePopupMenu"
        @click-notification="openNotificationModal"
        @click-create-channel="openChannelCreateModal"
      />
    </portal>
  </header>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  ref,
  PropType
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import MainViewHeaderChannelName from './MainViewHeaderChannelName.vue'
import MainViewHeaderTools, {
  targetPortalName
} from './MainViewHeaderTools.vue'
import MainViewHeaderToolsMenu from './MainViewHeaderToolsMenu.vue'

type Props = {
  channelId: ChannelId
}

const usePopupMenu = () => {
  const isPopupMenuShown = ref(false)
  const togglePopupMenu = () => {
    isPopupMenuShown.value = !isPopupMenuShown.value
  }
  const closePopupMenu = () => {
    isPopupMenuShown.value = !isPopupMenuShown.value
  }
  return { isPopupMenuShown, togglePopupMenu, closePopupMenu }
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

const useChannelCreateModal = (props: Props) => {
  const openChannelCreateModal = () => {
    store.dispatch.ui.modal.pushModal({
      type: 'channel-create',
      parentChannelId: props.channelId
    })
  }
  return { openChannelCreateModal }
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
    MainViewHeaderTools,
    MainViewHeaderToolsMenu
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props) {
    const { isPopupMenuShown, togglePopupMenu, closePopupMenu } = usePopupMenu()
    const { channelState } = useChannelState(props)
    const { starChannel, unstarChannel } = useStarChannel(props)
    const { openNotificationModal } = useNotificationModal(props)
    const { openChannelCreateModal } = useChannelCreateModal(props)
    const styles = useStyles()
    return {
      isPopupMenuShown,
      channelState,
      styles,
      starChannel,
      unstarChannel,
      openNotificationModal,
      openChannelCreateModal,
      togglePopupMenu,
      closePopupMenu,
      targetPortalName
    }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 16px;
}
.tools {
  flex-shrink: 0;
}
.toolsMenu {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 999;
}
</style>
