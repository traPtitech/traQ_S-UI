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

<script lang="ts" setup>
import { ChannelId } from '/@/types/entity-ids'
import useQall from './composables/useQall'
import useChannelState from './composables/useChannelState'
import useStarChannel from './composables/useStarChannel'
import useNotificationModal from './composables/useNotificationModal'
import useChannelCreateModal from './composables/useChannelCreateModal'
import useChannelManageModal from './composables/useChannelManageModal'
import { teleportTargetName } from './HeaderToolsList.vue'
import { embeddingOrigin } from '/@/lib/apis'
import { useCommandPalette } from '/@/store/app/commandPalette'
import useChannelPath from '/@/composables/useChannelPath'
import { constructChannelPath } from '/@/router'
import ClickOutside from '/@/components/UI/ClickOutside'
import HeaderToolsList from './HeaderToolsList.vue'
import HeaderToolsMenu from './HeaderToolsMenu.vue'
import useToggle from '/@/composables/useToggle'
import useExecWithToast from '/@/composables/toast/useExecWithToast'

const props = defineProps<{
  channelId: ChannelId
}>()

const {
  value: isPopupMenuShown,
  toggle: togglePopupMenu,
  close: closePopupMenu
} = useToggle(false)
const { channelState } = useChannelState(props)
const { starChannel, unstarChannel } = useStarChannel(props)
const { openNotificationModal } = useNotificationModal(props)
const { isChildChannelCreatable, openChannelCreateModal } =
  useChannelCreateModal(props)

const { channelIdToPathString } = useChannelPath()
const { execWithToast } = useExecWithToast()
const copyLink = async () => {
  execWithToast(
    'チャンネルリンクをコピーしました',
    'チャンネルリンクをコピーできませんでした',
    async () => {
      const channelPath = channelIdToPathString(props.channelId)
      const channelUrl = `${embeddingOrigin}${constructChannelPath(
        channelPath
      )}`

      await navigator.clipboard.writeText(`[#${channelPath}](${channelUrl})`)
    }
  )
}

const {
  hasActiveQallSession,
  isJoinedQallSession,
  isQallSessionOpened,
  isJoinedWithCurrentDevice,
  toggleQall
} = useQall(props)
const { openChannelManageModal } = useChannelManageModal(props)
const { openCommandPalette } = useCommandPalette()
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
