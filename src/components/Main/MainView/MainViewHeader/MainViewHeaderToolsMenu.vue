<template>
  <main-view-header-popup-frame>
    <main-view-header-tools-menu-item
      @click.native="context.emit('click-create-channel')"
      icon-name="hash"
      label="子チャンネルを作成"
    />
    <main-view-header-tools-menu-item
      @click.native="context.emit('click-notification')"
      icon-name="bell"
      icon-mdi
      label="通知設定"
    />
  </main-view-header-popup-frame>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import MainViewHeaderPopupFrame from './MainViewHeaderPopupFrame.vue'
import MainViewHeaderToolsMenuItem from './MainViewHeaderToolsMenuItem.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'MainViewHeaderToolsMenu',
  components: {
    MainViewHeaderPopupFrame,
    MainViewHeaderToolsMenuItem
  },
  setup(_, context) {
    const styles = useStyles()
    return { styles, context }
  }
})
</script>
