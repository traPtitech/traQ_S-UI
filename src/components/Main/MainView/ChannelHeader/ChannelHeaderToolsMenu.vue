<template>
  <main-view-header-popup-frame>
    <header-tools-menu-item
      v-if="isMobile && isQallFeatureEnabled"
      :icon-name="qallIconName"
      icon-mdi
      :class="$style.qallIcon"
      :label="qallLabel"
      :disabled="!canToggleQall"
      :data-is-active="$boolAttr(isQallSessionOpened)"
      @click="toggleQall"
    />
    <header-tools-menu-item
      v-if="isChildChannelCreatable"
      icon-name="hash"
      label="子チャンネルを作成"
      @click="clickCreateChannel"
    />
    <header-tools-menu-item
      v-if="showNotificationSettingBtn"
      icon-name="notified-or-subscribed"
      label="通知設定"
      @click="clickNotification"
    />
    <header-tools-menu-item
      v-if="isSearchEnabled"
      icon-name="search"
      icon-mdi
      label="チャンネル内検索"
      @click="clickSearch"
    />
    <header-tools-menu-item
      icon-name="link"
      icon-mdi
      label="チャンネルリンクをコピー"
      @click="clickCopyChannelLink"
    />
    <header-tools-menu-item
      v-if="hasChannelEditPermission"
      icon-name="hash"
      :class="$style.manageChannel"
      label="チャンネル管理"
      @click="clickManageChannel"
    />
  </main-view-header-popup-frame>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useResponsiveStore } from '/@/store/ui/responsive'
import { UserPermission } from '@traptitech/traq'
import { useMeStore } from '/@/store/domain/me'
import MainViewHeaderPopupFrame from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupFrame.vue'
import HeaderToolsMenuItem from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupMenuItem.vue'
import useQall from './composables/useQall'
import { ChannelId } from '/@/types/entity-ids'

const props = withDefaults(
  defineProps<{
    channelId: ChannelId
    showNotificationSettingBtn?: boolean
    isChildChannelCreatable?: boolean
    isArchived?: boolean
  }>(),
  {
    showNotificationSettingBtn: true,
    isChildChannelCreatable: false,
    isArchived: false
  }
)

const emit = defineEmits<{
  (e: 'clickCreateChannel'): void
  (e: 'clickNotification'): void
  (e: 'clickSearch'): void
  (e: 'clickCopyChannelLink'): void
  (e: 'clickManageChannel'): void
}>()

const isSearchEnabled = window.traQConfig.enableSearch ?? false

const {
  isQallFeatureEnabled,
  isQallSessionOpened,
  canToggleQall,
  qallIconName,
  qallLabel,
  toggleQall
} = useQall(props)

const { detail } = useMeStore()
const { isMobile } = useResponsiveStore()
const hasChannelEditPermission = computed(() =>
  detail.value?.permissions.includes(UserPermission.EditChannel)
)

const clickCreateChannel = () => {
  emit('clickCreateChannel')
}
const clickNotification = () => {
  emit('clickNotification')
}
const clickSearch = () => {
  emit('clickSearch')
}
const clickCopyChannelLink = () => {
  emit('clickCopyChannelLink')
}
const clickManageChannel = () => {
  emit('clickManageChannel')
}
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
