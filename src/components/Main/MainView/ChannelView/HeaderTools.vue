<template>
  <div>
    <header-tools-list
      :class="$style.tools"
      :is-forced-channel="channelState.forced"
      :has-active-qall-session="hasActiveQallSession"
      :is-qall-session-opened="isQallSessionOpened"
      :is-joined-qall-session="isJoinedQallSession"
      :is-stared="channelState.stared"
      :is-archived="channelState.archived"
      @click-qall="toggleQall"
      @star-channel="starChannel"
      @unstar-channel="unstarChannel"
      @click-more="togglePopupMenu"
    />
    <teleport v-if="isPopupMenuShown" :to="`#${teleportTargetName}`">
      <header-tools-menu
        :class="$style.toolsMenu"
        :show-notification-setting-btn="!channelState.forced"
        :has-active-qall-session="hasActiveQallSession"
        :is-qall-session-opened="isQallSessionOpened"
        :is-joined-qall-session="isJoinedQallSession"
        :can-create-child-channel="canCreateChildChannel"
        :is-archived="channelState.archived"
        v-click-outside="closePopupMenu"
        @click-notification="openNotificationModal"
        @click-create-channel="openChannelCreateModal"
        @click-copy-channel-link="copyLink"
        @click-qall="toggleQall"
        @click-manage-channel="openChannelManageModal"
      />
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ChannelId } from '@/types/entity-ids'
import clipboard from '@cloudcmd/clipboard'
import useQall from './use/qall'
import usePopupMenu from './use/popupMenu'
import useChannelState from './use/channelState'
import useStarChannel from './use/starChannel'
import useNotificationModal from './use/notificationModal'
import useChannelCreateModal from './use/channelCreateModal'
import useChannelManageModal from './use/channelManageModal'
import HeaderToolsList, { teleportTargetName } from './HeaderToolsList.vue'
import HeaderToolsMenu from './HeaderToolsMenu.vue'
import { embeddingOrigin } from '@/lib/apis'
import store from '@/store'
import { useRoute } from 'vue-router'

const useCopy = () => {
  const route = useRoute()
  const copyLink = async () => {
    try {
      await clipboard.writeText(
        `[#${route.params['channel']}](${embeddingOrigin}${route.path})`
      )
      store.commit.ui.toast.addToast({
        type: 'info',
        text: 'チャンネルリンクをコピーしました'
      })
    } catch {
      store.commit.ui.toast.addToast({
        type: 'error',
        text: 'チャンネルリンクをコピーできませんでした'
      })
    }
  }
  return { copyLink }
}

export default defineComponent({
  name: 'ChannelViewHeader',
  components: {
    HeaderToolsList,
    HeaderToolsMenu
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
    const {
      canCreateChildChannel,
      openChannelCreateModal
    } = useChannelCreateModal(props)
    const { copyLink } = useCopy()
    const {
      hasActiveQallSession,
      isJoinedQallSession,
      isQallSessionOpened,
      toggleQall
    } = useQall(props)
    const { openChannelManageModal } = useChannelManageModal(props)
    return {
      hasActiveQallSession,
      isQallSessionOpened,
      isJoinedQallSession,
      isPopupMenuShown,
      channelState,
      toggleQall,
      starChannel,
      unstarChannel,
      openNotificationModal,
      canCreateChildChannel,
      openChannelCreateModal,
      openChannelManageModal,
      copyLink,
      togglePopupMenu,
      closePopupMenu,
      teleportTargetName
    }
  }
})
</script>

<style lang="scss" module>
.tools {
  flex-shrink: 0;
}
.toolsMenu {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: $z-index-header-tools;
}
</style>
