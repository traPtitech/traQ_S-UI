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
import { defineComponent, computed } from 'vue'
import MainViewHeaderPopupFrame from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupFrame.vue'
import HeaderToolsMenuItem from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupMenuItem.vue'
import useIsMobile from '/@/use/isMobile'
import store from '/@/vuex'
import { UserPermission } from '@traptitech/traq'

const isSkywayApikeySet = window.traQConfig.skyway !== undefined
const isSearchEnabled = window.traQConfig.enableSearch ?? false

export default defineComponent({
  name: 'HeaderToolsMenu',
  components: {
    MainViewHeaderPopupFrame,
    HeaderToolsMenuItem
  },
  props: {
    showNotificationSettingBtn: { type: Boolean, default: true },
    hasActiveQallSession: { type: Boolean, default: false },
    isQallSessionOpened: { type: Boolean, default: false },
    isJoinedQallSession: { type: Boolean, default: false },
    isJoinedWithCurrentDevice: { type: Boolean, default: false },
    isChildChannelCreatable: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false }
  },
  emits: {
    clickQall: () => true,
    clickCreateChannel: () => true,
    clickNotification: () => true,
    clickSearch: () => true,
    clickCopyChannelLink: () => true,
    clickManageChannel: () => true
  },
  setup(props, { emit }) {
    const { isMobile } = useIsMobile()
    const isQallEnabled = computed(
      () => isSkywayApikeySet && store.state.app.rtcSettings.isEnabled
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
      store.state.domain.me.detail?.permissions.includes(
        UserPermission.EditChannel
      )
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

    return {
      isMobile,
      isQallEnabled,
      qallLabel,
      isSearchEnabled,
      hasChannelEditPermission,
      clickQall,
      clickCreateChannel,
      clickNotification,
      clickSearch,
      clickCopyChannelLink,
      clickManageChannel
    }
  }
})
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
