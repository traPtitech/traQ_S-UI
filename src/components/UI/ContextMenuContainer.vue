<template>
  <teleport to="#message-menu-popup">
    <div ref="menuContainerRef">
      <click-outside @click-outside="close">
        <div :style="styles.toolsMenu" :class="$style.toolsMenu">
          <slot />
        </div>
      </click-outside>
    </div>
  </teleport>
</template>

<script lang="ts">
import {
  reactive,
  computed,
  ref,
  Ref,
  shallowRef,
  toRef,
  watch,
  nextTick
} from 'vue'
import { Point } from '/@/lib/basic/point'

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

const useStyles = (position: Ref<Point>, height: Ref<number>) =>
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
</script>

<script lang="ts" setup>
import ClickOutside from '/@/components/UI/ClickOutside'

const props = defineProps<{
  position: Point
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const position = toRef(props, 'position')
const { height, menuContainerRef } = useMenuHeight()
const styles = useStyles(position, height)

const close = () => {
  emit('close')
}
</script>

<style lang="scss" module>
.toolsMenu {
  position: absolute;
  z-index: $z-index-message-element-tools-menu;
  transform: translateX(-100%);
}
</style>
