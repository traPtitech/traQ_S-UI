<template>
  <main-view-header-popup-frame>
    <header-tools-menu-item
      v-if="isMobile && isQallEnabled"
      icon-name="phone"
      icon-mdi
      :class="$style.qallIcon"
      :label="qallLabel"
      :disabled="
        isArchived ||
        (hasActiveQallSession &&
          (!isJoinedQallSession || !isJoinedWithCurrentDevice))
      "
      :data-is-active="$boolAttr(isQallSessionOpened)"
      @click="clickQall"
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

<script lang="ts">
import { computed } from 'vue';
import { useResponsiveStore } from '/@/store/ui/responsive'
import { UserPermission } from '@traptitech/traq'
import { useRtcSettings } from '/@/store/app/rtcSettings'
import { useMeStore } from '/@/store/domain/me'

const isSkywayApikeySet = window.traQConfig.skyway !== undefined
const isSearchEnabled = window.traQConfig.enableSearch ?? false
</script>

<script lang="ts" setup>
import MainViewHeaderPopupFrame from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupFrame.vue';
import HeaderToolsMenuItem from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupMenuItem.vue';

const props = withDefaults(defineProps<{
    showNotificationSettingBtn?: boolean,
    hasActiveQallSession?: boolean,
    isQallSessionOpened?: boolean,
    isJoinedQallSession?: boolean,
    isJoinedWithCurrentDevice?: boolean,
    isChildChannelCreatable?: boolean,
    isArchived?: boolean
}>(), {
    showNotificationSettingBtn: true,
    hasActiveQallSession: false,
    isQallSessionOpened: false,
    isJoinedQallSession: false,
    isJoinedWithCurrentDevice: false,
    isChildChannelCreatable: false,
    isArchived: false
});

const emit = defineEmits<{
    (e: "clickQall"): void,
    (e: "clickCreateChannel"): void,
    (e: "clickNotification"): void,
    (e: "clickSearch"): void,
    (e: "clickCopyChannelLink"): void,
    (e: "clickManageChannel"): void
}>();

const { detail } = useMeStore()
const { isEnabled: isRtcEnabled } = useRtcSettings()
const { isMobile } = useResponsiveStore()
const isQallEnabled = computed(
  () => isSkywayApikeySet && isRtcEnabled.value
)
const qallLabel = computed(() => {
  if (props.isQallSessionOpened) {
    if (props.isJoinedWithCurrentDevice) {
      return 'Qallを終了'
    }
    if (props.isJoinedQallSession) {
      return '別のデバイスでQall中'
    }
    return 'Qallに参加'
  }
  if (props.hasActiveQallSession) {
    return '他チャンネルでQall中'
  }
  return 'Qallを開始'
})
const hasChannelEditPermission = computed(() =>
  detail.value?.permissions.includes(UserPermission.EditChannel)
)

const clickQall = () => {
  emit('clickQall')
}
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
