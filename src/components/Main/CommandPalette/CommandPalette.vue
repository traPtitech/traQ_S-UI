<template>
  <div :class="$style.container" v-click-outside="closeCommandPalette">
    <command-palette-input />
    <hr :class="$style.separator" />
    <search-result v-if="store.mode === 'search'" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCommandPaletteStore } from '@/providers/commandPalette'
import CommandPaletteInput from './CommandPaletteInput.vue'
import SearchResult from './SearchResult.vue'

export default defineComponent({
  components: {
    CommandPaletteInput,
    SearchResult
  },
  name: 'CommandPalette',
  setup() {
    const {
      closeCommandPalette,
      commandPaletteStore: store
    } = useCommandPaletteStore()

    return { closeCommandPalette, store }
  }
})
</script>

<style lang="scss" module>
$command-palette-max-width: 800px;
.container {
  @include background-primary;
  width: 100%;
  margin: 48px auto 8px auto;
  max-width: $command-palette-max-width;
  border-radius: 8px;
  border: 2px solid $theme-background-secondary;
}
.separator {
  @include background-secondary;
  height: 2px;
  border: none;
  margin: 0;
}
</style>
