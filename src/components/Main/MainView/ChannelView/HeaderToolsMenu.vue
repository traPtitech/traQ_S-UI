<template>
  <main-view-header-popup-frame>
    <header-tools-menu-item
      v-if="isMobile"
      @click.native="context.emit('click-qall')"
      icon-name="phone"
      icon-mdi
      :style="styles.qallIcon"
      :label="qallLabel"
      :disabled="hasActiveQallSession && !isJoinedQallSession"
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
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import MainViewHeaderPopupFrame from '@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupFrame.vue'
import HeaderToolsMenuItem from '@/components/Main/MainView/MainViewHeader/MainViewHeaderPpopupMenuItem.vue'
import useIsMobile from '@/use/isMobile'

const useStyles = (props: {
  isQallSessionOpened: boolean
  isJoinedQallSession: boolean
}) =>
  reactive({
    qallIcon: makeStyles((_, common) => ({
      color:
        props.isJoinedQallSession || props.isQallSessionOpened
          ? common.ui.qall
          : ''
    }))
  })

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
    const styles = useStyles(props)
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
    return { styles, context, isMobile, qallLabel }
  }
})
</script>
