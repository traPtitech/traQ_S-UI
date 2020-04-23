<template>
  <main-view-header>
    <template #header>
      <header-channel-name :channel-id="channelId" />
    </template>
    <template #tools>
      <header-tools
        :class="$style.tools"
        :is-stared="channelState.stared"
        @star-channel="starChannel"
        @unstar-channel="unstarChannel"
        @click-more="togglePopupMenu"
      />
      <portal v-if="isPopupMenuShown" :to="targetPortalName">
        <header-tools-menu
          :class="$style.toolsMenu"
          v-click-outside="closePopupMenu"
          @click-notification="openNotificationModal"
          @click-create-channel="openChannelCreateModal"
          @click-copy-channel-link="copyLink"
        />
      </portal>
    </template>
  </main-view-header>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  PropType,
  SetupContext
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import useIsMobile from '@/use/isMobile'
import usePopupMenu from './use/popupMenu'
import useChannelState from './use/channelState'
import useStarChannel from './use/starChannel'
import useNotificationModal from './use/notificationModal'
import useChannelCreateModal from './use/channelCreateModal'
import MainViewHeader from '@/components/Main/MainView/MainViewHeader/MainViewHeader.vue'
import HeaderChannelName from './HeaderChannelName.vue'
import HeaderTools, { targetPortalName } from './HeaderTools.vue'
import HeaderToolsMenu from './HeaderToolsMenu.vue'
import { embeddingOrigin } from '@/lib/apis'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary,
      borderBottom: `2px solid ${theme.ui.tertiary}`
    })),
    navigationButton: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

const useCopy = (context: SetupContext) => {
  const copyLink = async () => {
    await navigator.clipboard.writeText(
      `[#${context.root.$route.params['channel']}](${embeddingOrigin}${context.root.$route.path})`
    )
  }
  return { copyLink }
}

export default defineComponent({
  name: 'ChannelViewHeader',
  components: {
    Icon,
    MainViewHeader,
    HeaderChannelName,
    HeaderTools,
    HeaderToolsMenu
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props, context) {
    const { isPopupMenuShown, togglePopupMenu, closePopupMenu } = usePopupMenu()
    const { channelState } = useChannelState(props)
    const { starChannel, unstarChannel } = useStarChannel(props)
    const { openNotificationModal } = useNotificationModal(props)
    const { openChannelCreateModal } = useChannelCreateModal(props)
    const styles = useStyles()
    const { isMobile } = useIsMobile()
    const { copyLink } = useCopy(context)
    return {
      isPopupMenuShown,
      channelState,
      styles,
      starChannel,
      unstarChannel,
      openNotificationModal,
      openChannelCreateModal,
      copyLink,
      togglePopupMenu,
      closePopupMenu,
      targetPortalName,
      isMobile
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
.headerContainer {
  display: flex;
}
.navigationButton {
  display: flex;
  align-items: center;
  margin-right: 8px;
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
