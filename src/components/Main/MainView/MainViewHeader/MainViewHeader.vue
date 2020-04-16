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
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import usePopupMenu from './use/popupMenu'
import useChannelState from './use/channelState'
import useStarChannel from './use/starChannel'
import useNotificationModal from './use/notificationModal'
import useChannelCreateModal from './use/channelCreateModal'
import MainViewHeaderChannelName from './MainViewHeaderChannelName.vue'
import MainViewHeaderTools, {
  targetPortalName
} from './MainViewHeaderTools.vue'
import MainViewHeaderToolsMenu from './MainViewHeaderToolsMenu.vue'

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
