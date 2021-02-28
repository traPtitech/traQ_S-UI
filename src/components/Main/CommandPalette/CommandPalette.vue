<template>
  <div :class="$style.container" v-click-outside="closeCommandPalette">
    <command-palette-input />
    <hr
      :class="$style.separator"
      v-if="store.mode === 'search' && store.query.length > 0"
    />
    <search-result v-if="store.mode === 'search' && store.query.length > 0" />
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
$command-palette-max-width: min(800px, calc(100vw - 16px));
.container {
  @include background-primary;
  width: 100%;
  margin: 32px auto 24px auto;
  max-width: $command-palette-max-width;
  max-height: calc(100vh - 56px);
  border-radius: 8px;
  border: 2px solid $theme-background-secondary;
  display: grid;
  grid-template-rows: 48px 2px 1fr;
}
.separator {
  @include background-secondary;
  border: none;
  margin: 0;
}
</style>
