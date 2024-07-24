<template>
  <primary-view-header-popup-frame>
    <header-tools-menu-item
      v-if="isMobile && isQallFeatureEnabled"
      :icon-name="qallIconName"
      icon-mdi
      :class="$style.qallIcon"
      :label="qallLabel"
      :disabled="!canToggleQall"
      :data-is-active="$boolAttr(isQallSessionOpened)"
      @click="toggleQall"
      @click-item="emit('clickItem')"
    />
    <header-tools-menu-item
      v-if="isChildChannelCreatable"
      icon-name="hash"
      label="子チャンネルを作成"
      @click="openChannelCreateModal"
      @click-item="emit('clickItem')"
    />
    <header-tools-menu-item
      v-if="showNotificationSettingBtn"
      icon-name="notified-or-subscribed"
      label="通知設定"
      @click="openNotificationModal"
      @click-item="emit('clickItem')"
    />
    <header-tools-menu-item
      v-if="isSearchEnabled"
      icon-name="search"
      icon-mdi
      label="チャンネル内検索"
      @click="openCommandPalette('search', 'in:here ')"
      @click-item="emit('clickItem')"
    />
    <header-tools-menu-item
      icon-name="link"
      icon-mdi
      label="チャンネルリンクをコピー"
      @click="copyLink"
      @click-item="emit('clickItem')"
    />
    <header-tools-menu-item
      v-if="hasChannelEditPermission"
      icon-name="hash"
      :class="$style.manageChannel"
      label="チャンネル管理"
      @click="openChannelManageModal"
      @click-item="emit('clickItem')"
    />
  </primary-view-header-popup-frame>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useResponsiveStore } from '/@/store/ui/responsive'
import { UserPermission } from '@traptitech/traq'
import { useMeStore } from '/@/store/domain/me'
import PrimaryViewHeaderPopupFrame from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeaderPopupFrame.vue'
import HeaderToolsMenuItem from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeaderPopupMenuItem.vue'
import useQall from './composables/useQall'
import type { ChannelId } from '/@/types/entity-ids'
import useChannelCreateModal from './composables/useChannelCreateModal'
import useNotificationModal from './composables/useNotificationModal'
import { useCommandPalette } from '/@/store/app/commandPalette'
import useChannelManageModal from './composables/useChannelManageModal'
import useCopyChannelLink from './composables/useCopyChannelLink'

const emit = defineEmits<{
  (e: 'clickItem'): void
}>()

const props = withDefaults(
  defineProps<{
    channelId: ChannelId
    showNotificationSettingBtn?: boolean
    isArchived?: boolean
  }>(),
  {
    showNotificationSettingBtn: true,
    isArchived: false
  }
)

const { isMobile } = useResponsiveStore()

const {
  isQallFeatureEnabled,
  isQallSessionOpened,
  canToggleQall,
  qallIconName,
  qallLabel,
  toggleQall
} = useQall(props)

const { isChildChannelCreatable, openChannelCreateModal } =
  useChannelCreateModal(props)

const { openNotificationModal } = useNotificationModal(props)

const isSearchEnabled = window.traQConfig.enableSearch ?? false
const { openCommandPalette } = useCommandPalette()

const { copyLink } = useCopyChannelLink(props)

const { detail } = useMeStore()
const hasChannelEditPermission = computed(() =>
  detail.value?.permissions.includes(UserPermission.EditChannel)
)
const { openChannelManageModal } = useChannelManageModal(props)
</script>

<style lang="scss" module>
.qallIcon {
  &[data-is-active] {
    color: $common-ui-qall;
  }
}
.manageChannel {
  color: $theme-accent-error-default;
}
</style>
