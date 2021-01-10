<template>
  <teleport v-show="isShown" to="#message-menu-popup">
    <div ref="menuContainerRef">
      <message-tools-menu
        v-if="isShown"
        :style="styles.toolsMenu"
        :class="$style.toolsMenu"
        :message-id="state.target"
        v-click-outside="closeContextMenu"
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
  shallowRef,
  toRef
} from 'vue'
import MessageToolsMenu from './MessageToolsMenu.vue'
import { useMessageContextMenuStore } from './providers/messageContextMenu'

const useMenuHeight = (context: SetupContext, isShown: Ref<boolean>) => {
  const height = ref(0)
  const menuContainerRef = shallowRef<HTMLDivElement | null>(null)
  watch(isShown, async newVal => {
    if (!newVal) return
    await nextTick()
    const $menu = menuContainerRef.value?.firstElementChild
    height.value = $menu?.clientHeight ?? 0
  })
  return { height, menuContainerRef }
}

const useStyles = (
  position: Ref<{ x: number; y: number }>,
  isShown: Ref<boolean>,
  height: Ref<number>
) =>
  reactive({
    toolsMenu: computed(() => {
      if (!isShown.value) return {}
      const margin = 20
      return {
        top: `min(calc(100vh - ${height.value + margin}px), ${
          position.value.y
        }px)`,
        left: `${position.value.x}px`
      }
    })
  })

export default defineComponent({
  name: 'MessageToolsMenuContainer',
  components: {
    MessageToolsMenu
  },
  setup(_, context) {
    const { state, isShown, closeContextMenu } = useMessageContextMenuStore()
    const position = toRef(state, 'position')

    const { height, menuContainerRef } = useMenuHeight(context, isShown)
    const styles = useStyles(position, isShown, height)

    return {
      state,
      isShown,
      height,
      menuContainerRef,
      styles,
      closeContextMenu
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
