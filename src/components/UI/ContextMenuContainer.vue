<template>
  <teleport to="#message-menu-popup">
    <click-outside @click-outside.stop="emit('close')">
      <div
        ref="menuContainerRef"
        :style="toolsMenuStyle"
        :class="$style.toolsMenu"
      >
        <slot />
      </div>
    </click-outside>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, ref, toRef } from 'vue'
import ClickOutside from '/@/components/UI/ClickOutside'
import useBoxSize from '/@/composables/dom/useBoxSize'
import type { Point } from '/@/lib/basic/point'

const props = defineProps<{
  position: Point
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const position = toRef(props, 'position')

const menuContainerRef = ref<HTMLDivElement | null>(null)
const { height } = useBoxSize(menuContainerRef)

const toolsMenuStyle = computed(() => {
  const margin = 20
  return {
    top: `min(calc(100vh - ${(height?.value ?? 0) + margin}px), ${
      position.value.y
    }px)`,
    left: `${position.value.x}px`
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
