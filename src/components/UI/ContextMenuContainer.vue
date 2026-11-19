<template>
  <teleport to="#message-menu-popup">
    <ClickOutside @click-outside="emit('close')">
      <div
        :class="$style.toolsMenu"
        :style="{
          '--anchor-y': `${position.y}px`,
          left: `${position.x}px`
        }"
      >
        <slot />
      </div>
    </ClickOutside>
  </teleport>
</template>

<script lang="ts" setup>
import ClickOutside from '/@/components/UI/ClickOutside'
import type { Point } from '/@/lib/basic/point'

defineProps<{
  position: Point
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<style lang="scss" module>
.toolsMenu {
  $viewport-margin: 20px;

  @include background-primary;
  @include drop-shadow-default;
  position: absolute;
  top: 0;
  z-index: $z-index-message-element-tools-menu;
  width: max-content;
  max-height: calc(100dvh - 2 * $viewport-margin);
  overflow-y: auto;
  border-radius: 4px;
  transform: translate(
    -100%,
    min(var(--anchor-y), calc(100dvh - $viewport-margin - 100%))
  );
}
</style>
