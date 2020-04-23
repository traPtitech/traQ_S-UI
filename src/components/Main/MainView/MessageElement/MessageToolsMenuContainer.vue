<template>
  <portal v-show="state.isPopupMenuShown" :to="targetPortalName">
    <message-tools-menu
      v-if="state.isPopupMenuShown"
      :style="styles.toolsMenu"
      :class="$style.toolsMenu"
      :message-id="state.messageId"
      v-click-outside="closePopupMenu"
    />
  </portal>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import MessageToolsMenu from './MessageToolsMenu.vue'
import { targetPortalName } from '@/views/Main.vue'

const useStampPicker = () => {
  const state = reactive({
    messageId: computed(() => store.state.ui.messageContextMenu.target),
    isPopupMenuShown: computed(() => store.getters.ui.messageContextMenu.isShow)
  })
  return { state }
}

const useStyles = (state: { isPopupMenuShown: boolean }) =>
  reactive({
    toolsMenu: makeStyles(theme => ({
      top: state.isPopupMenuShown
        ? `${store.state.ui.messageContextMenu.position.y}px`
        : '',
      left: state.isPopupMenuShown
        ? `${store.state.ui.messageContextMenu.position.x}px`
        : ''
    }))
  })

export default defineComponent({
  name: 'MessageToolsMenuContainer',
  components: {
    MessageToolsMenu
  },
  setup() {
    const { state } = useStampPicker()
    const styles = useStyles(state)
    const closePopupMenu = () => {
      store.dispatch.ui.messageContextMenu.closeMessageContextMenu()
    }
    return { state, styles, targetPortalName, closePopupMenu }
  }
})
</script>

<style lang="scss" module>
.toolsMenu {
  position: absolute;
  z-index: 999;
  transform: translateX(-100%);
}
</style>
