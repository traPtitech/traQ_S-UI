<template>
  <portal v-show="state.isPopupMenuShown" :to="targetPortalName">
    <div ref="menuContainerRef">
      <message-tools-menu
        v-if="state.isPopupMenuShown"
        :style="styles.toolsMenu"
        :class="$style.toolsMenu"
        :message-id="state.messageId"
        v-click-outside="closePopupMenu"
      />
    </div>
  </portal>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  ref,
  Ref,
  watch,
  SetupContext
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import MessageToolsMenu from './MessageToolsMenu.vue'
import { targetPortalName } from '@/views/Main.vue'

const useMenu = () => {
  const state = reactive({
    messageId: computed(() => store.state.ui.messageContextMenu.target),
    isPopupMenuShown: computed(() => store.getters.ui.messageContextMenu.isShow)
  })
  return { state }
}

const useMenuHeight = (
  context: SetupContext,
  state: { isPopupMenuShown: boolean }
) => {
  const height = ref(0)
  const menuContainerRef = ref<HTMLDivElement>(null)
  watch(
    () => state.isPopupMenuShown,
    async newVal => {
      if (!newVal) return
      await context.root.$nextTick()
      const $menu = menuContainerRef.value?.firstElementChild
      height.value = $menu?.clientHeight ?? 0
    }
  )
  return { height, menuContainerRef }
}

const useStyles = (state: { isPopupMenuShown: boolean }, height: Ref<number>) =>
  reactive({
    toolsMenu: makeStyles(theme => {
      if (!state.isPopupMenuShown) return {}
      const margin = 20
      return {
        top: `min(calc(100vh - ${height.value + margin}px), ${
          store.state.ui.messageContextMenu.position.y
        }px)`,
        left: `${store.state.ui.messageContextMenu.position.x}px`
      }
    })
  })

export default defineComponent({
  name: 'MessageToolsMenuContainer',
  components: {
    MessageToolsMenu
  },
  setup(_, context) {
    const { state } = useMenu()
    const { height, menuContainerRef } = useMenuHeight(context, state)

    const styles = useStyles(state, height)
    const closePopupMenu = () => {
      store.dispatch.ui.messageContextMenu.closeMessageContextMenu()
    }
    return {
      state,
      height,
      menuContainerRef,
      styles,
      targetPortalName,
      closePopupMenu
    }
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
