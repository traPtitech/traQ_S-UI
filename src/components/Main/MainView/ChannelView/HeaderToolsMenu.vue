<template>
  <main-view-header-popup-frame>
    <header-tools-menu-item
      @click.native="context.emit('click-create-channel')"
      icon-name="hash"
      label="子チャンネルを作成"
    />
    <header-tools-menu-item
      @click.native="context.emit('click-notification')"
      icon-name="bell"
      icon-mdi
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
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import MainViewHeaderPopupFrame from '@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupFrame.vue'
import HeaderToolsMenuItem from './HeaderToolsMenuItem.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'ChannelViewHeaderToolsMenu',
  components: {
    MainViewHeaderPopupFrame,
    HeaderToolsMenuItem
  },
  setup(_, context) {
    const styles = useStyles()
    return { styles, context }
  }
})
</script>
