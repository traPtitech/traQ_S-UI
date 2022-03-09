<template>
  <teleport to="#message-menu-popup">
    <div ref="menuContainerRef">
      <click-outside @click-outside="closeContextMenu">
        <div :style="styles.toolsMenu" :class="$style.toolsMenu"><slot /></div>
      </click-outside>
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
  shallowRef,
  PropType,
  toRef,
  watch,
  nextTick
} from 'vue'
import ClickOutside from '/@/components/UI/ClickOutside'

const useMenuHeight = () => {
  const height = ref(0)
  const menuContainerRef = shallowRef<HTMLDivElement | null>(null)
  watch(menuContainerRef, async newVal => {
    if (!newVal) return
    await nextTick()
    const $menu = menuContainerRef.value?.firstElementChild
    height.value = $menu?.clientHeight ?? 0
  })
  return { height, menuContainerRef }
}

const useStyles = (
  position: Ref<{ x: number; y: number }>,
  height: Ref<number>
) =>
  reactive({
    toolsMenu: computed(() => {
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
  components: { ClickOutside },
  props: {
    position: {
      type: Object as PropType<{ x: number; y: number }>,
      required: true
    }
  },
  emits: {
    closeContextMenu: () => true
  },
  setup(props, { emit }) {
    const position = toRef(props, 'position')
    const { height, menuContainerRef } = useMenuHeight()
    const styles = useStyles(position, height)

    const closeContextMenu = () => {
      emit('closeContextMenu')
    }

    return {
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
