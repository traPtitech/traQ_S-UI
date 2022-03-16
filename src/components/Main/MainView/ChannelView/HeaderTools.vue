<template>
  <div>
    <header-tools-list
      :class="$style.tools"
      :channel-id="channelId"
      :is-forced-channel="channelState.forced"
      :has-active-qall-session="hasActiveQallSession"
      :is-qall-session-opened="isQallSessionOpened"
      :is-joined-qall-session="isJoinedQallSession"
      :is-joined-with-current-device="isJoinedWithCurrentDevice"
      :is-stared="channelState.stared"
      :is-archived="channelState.archived"
      @click-qall="toggleQall"
      @star-channel="starChannel"
      @unstar-channel="unstarChannel"
      @click-more="togglePopupMenu"
    />
    <teleport v-if="isPopupMenuShown" :to="`#${teleportTargetName}`">
      <click-outside @click-outside="closePopupMenu">
        <header-tools-menu
          :class="$style.toolsMenu"
          :show-notification-setting-btn="!channelState.forced"
          :has-active-qall-session="hasActiveQallSession"
          :is-qall-session-opened="isQallSessionOpened"
          :is-joined-qall-session="isJoinedQallSession"
          :is-joined-with-current-device="isJoinedWithCurrentDevice"
          :is-child-channel-creatable="isChildChannelCreatable"
          :is-archived="channelState.archived"
          @click-notification="openNotificationModal"
          @click-create-channel="openChannelCreateModal"
          @click-search="openCommandPalette('search', 'in:here ')"
          @click-copy-channel-link="copyLink"
          @click-qall="toggleQall"
          @click-manage-channel="openChannelManageModal"
        />
      </click-outside>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import useQall from './composables/useQall'
import usePopupMenu from './composables/usePopupMenu'
import useChannelState from './composables/useChannelState'
import useStarChannel from './composables/useStarChannel'
import useNotificationModal from './composables/useNotificationModal'
import useChannelCreateModal from './composables/useChannelCreateModal'
import useChannelManageModal from './composables/useChannelManageModal'
import ClickOutside from '/@/components/UI/ClickOutside'
import HeaderToolsList, { teleportTargetName } from './HeaderToolsList.vue'
import HeaderToolsMenu from './HeaderToolsMenu.vue'
import { embeddingOrigin } from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import { useCommandPalette } from '/@/store/app/commandPalette'
import useChannelPath from '/@/composables/useChannelPath'
import { constructChannelPath } from '/@/router'

const useCopy = (props: { channelId: ChannelId }) => {
  const { addInfoToast, addErrorToast } = useToastStore()
  const { channelIdToPathString } = useChannelPath()
  const copyLink = async () => {
    try {
      const channelPath = channelIdToPathString(props.channelId)
      const channelUrl = `${embeddingOrigin}${constructChannelPath(
        channelPath
      )}`

      await navigator.clipboard.writeText(`[#${channelPath}](${channelUrl})`)
      addInfoToast('チャンネルリンクをコピーしました')
    } catch {
      addErrorToast('チャンネルリンクをコピーできませんでした')
    }
  }
  return { copyLink }
}

export default defineComponent({
  name: 'HeaderTools',
  components: {
    ClickOutside,
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
    const { isChildChannelCreatable, openChannelCreateModal } =
      useChannelCreateModal(props)
    const { copyLink } = useCopy(props)
    const {
      hasActiveQallSession,
      isJoinedQallSession,
      isQallSessionOpened,
      isJoinedWithCurrentDevice,
      toggleQall
    } = useQall(props)
    const { openChannelManageModal } = useChannelManageModal(props)
    const { openCommandPalette } = useCommandPalette()
    return {
      hasActiveQallSession,
      isQallSessionOpened,
      isJoinedQallSession,
      isJoinedWithCurrentDevice,
      isPopupMenuShown,
      channelState,
      toggleQall,
      starChannel,
      unstarChannel,
      openNotificationModal,
      isChildChannelCreatable,
      openChannelCreateModal,
      openChannelManageModal,
      openCommandPalette,
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
  contain: content;
}
</style>
