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
      v-if="!isMobile || isScreenShareSessionOpened"
      @click.native="context.emit('click-screen-share')"
      icon-name="tv"
      icon-mdi
      :label="screenShareLabel"
      :disabled="hasActiveScreenShareSession && !isJoinedScreenShareSession"
      :data-is-active="isJoinedScreenShareSession || isScreenShareSessionOpened"
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
  </main-view-header-popup-frame>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import MainViewHeaderPopupFrame from '@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupFrame.vue'
import HeaderToolsMenuItem from '@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupMenuItem.vue'
import useIsMobile from '@/use/isMobile'

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
    isJoinedQallSession: { type: Boolean, default: false },
    hasActiveScreenShareSession: { type: Boolean, default: false },
    isScreenShareSessionOpened: { type: Boolean, default: false },
    isJoinedScreenShareSession: { type: Boolean, default: false }
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
    const screenShareLabel = computed(() => {
      if (props.isJoinedScreenShareSession) {
        return '画面共有を終了'
      }
      if (props.isScreenShareSessionOpened) {
        return '画面共有を視聴'
      }
      if (props.hasActiveScreenShareSession) {
        return '他チャンネルで画面共有中'
      }
      return '画面共有を開始'
    })
    return { context, isMobile, qallLabel, screenShareLabel }
  }
})
</script>

<style lang="scss" module>
.qallIcon {
  &[data-is-active] {
    color: $common-ui-qall;
  }
}
</style>
