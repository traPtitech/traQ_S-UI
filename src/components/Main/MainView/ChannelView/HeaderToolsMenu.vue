<template>
  <main-view-header-popup-frame>
    <header-tools-menu-item
      v-if="isMobile"
      @click.native="context.emit('click-qall')"
      icon-name="phone"
      icon-mdi
      :class="$style.qallIcon"
      :label="qallLabel"
      :disabled="hasActiveQallSession && !isJoinedQallSession"
      :data-is-active="isJoinedQallSession || isQallSessionOpened"
    />
    <header-tools-menu-item
      @click.native="context.emit('click-create-channel')"
      icon-name="hash"
      label="子チャンネルを作成"
    />
    <header-tools-menu-item
      v-if="showNotificationSettingBtn"
      @click.native="context.emit('click-notification')"
      icon-name="notified"
      label="通知設定"
    />
    <header-tools-menu-item
      @click.native="context.emit('click-copy-channel-link')"
      icon-name="link"
      icon-mdi
      label="チャンネルリンクをコピー"
    />
    <header-tools-menu-item
      v-if="hasChannelEditPermission"
      @click.native="context.emit('click-manage-channel')"
      icon-name="hash"
      :class="$style.manageChannel"
      label="チャンネル管理"
    />
  </main-view-header-popup-frame>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import MainViewHeaderPopupFrame from '@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupFrame.vue'
import HeaderToolsMenuItem from '@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupMenuItem.vue'
import useIsMobile from '@/use/isMobile'
import store from '@/store'
import { UserPermission } from '@traptitech/traq'

export default defineComponent({
  name: 'ChannelViewHeaderToolsMenu',
  components: {
    MainViewHeaderPopupFrame,
    HeaderToolsMenuItem
  },
  props: {
    showNotificationSettingBtn: { type: Boolean, default: true },
    hasActiveQallSession: { type: Boolean, default: false },
    isQallSessionOpened: { type: Boolean, default: false },
    isJoinedQallSession: { type: Boolean, default: false }
  },
  setup(props, context) {
    const { isMobile } = useIsMobile()
    const qallLabel = computed(() => {
      if (props.isJoinedQallSession) {
        return 'Qallを終了'
      }
      if (props.isQallSessionOpened) {
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
    return { context, isMobile, qallLabel, hasChannelEditPermission }
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
  color: $theme-accent-error;
}
</style>
