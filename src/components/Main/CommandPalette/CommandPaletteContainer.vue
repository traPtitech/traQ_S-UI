<template>
  <div v-if="isCommandPaletteShown" :class="$style.container">
    <command-palette />
  </div>
</template>

<script lang="ts" setup>
import CommandPalette from './CommandPalette.vue'
import { useCommandPalette } from '/@/store/app/commandPalette'

const { isCommandPaletteShown } = useCommandPalette()
</script>

<style lang="scss" module>
.container {
  @include background-common-overlay;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  z-index: $z-index-command-palette;
}
</style>
