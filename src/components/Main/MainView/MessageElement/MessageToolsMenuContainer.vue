<template>
  <teleport v-show="state.isPopupMenuShown" to="#message-menu-popup">
    <div ref="menuContainerRef">
      <message-tools-menu
        v-if="state.isPopupMenuShown"
        :style="styles.toolsMenu"
        :class="$style.toolsMenu"
        :message-id="state.messageId"
        v-click-outside="closePopupMenu"
      />
    </div>
  </teleport>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  ref,
  Ref,
  watch,
  SetupContext,
  nextTick,
  shallowRef
} from 'vue'
import store from '@/_store'
import MessageToolsMenu from './MessageToolsMenu.vue'

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
  const menuContainerRef = shallowRef<HTMLDivElement | null>(null)
  watch(
    () => state.isPopupMenuShown,
    async newVal => {
      if (!newVal) return
      await nextTick()
      const $menu = menuContainerRef.value?.firstElementChild
      height.value = $menu?.clientHeight ?? 0
    }
  )
  return { height, menuContainerRef }
}

const useStyles = (state: { isPopupMenuShown: boolean }, height: Ref<number>) =>
  reactive({
    toolsMenu: computed(() => {
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
      closePopupMenu
    }
  }
})
</script>

<style lang="scss" module>
.toolsMenu {
  position: absolute;
  z-index: $z-index-message-element-tools-menu;
  transform: translateX(-100%);
}
</style>
