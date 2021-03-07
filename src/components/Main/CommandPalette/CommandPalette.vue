<template>
  <div :class="$style.container" v-click-outside="closeCommandPalette">
    <command-palette-input />
    <hr :class="$style.separator" v-if="supplementalViewType" />
    <search-result v-if="supplementalViewType === 'search-result'" />
    <search-suggestion
      v-else-if="supplementalViewType === 'search-suggestion'"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useCommandPaletteStore } from '@/providers/commandPalette'
import CommandPaletteInput from './CommandPaletteInput.vue'
import SearchResult from './SearchResult.vue'
import SearchSuggestion from './SearchSuggestion.vue'

type SupplementalViewType = 'search-result' | 'search-suggestion' | undefined

export default defineComponent({
  components: {
    CommandPaletteInput,
    SearchResult,
    SearchSuggestion
  },
  name: 'CommandPalette',
  setup() {
    const {
      closeCommandPalette,
      commandPaletteStore: store
    } = useCommandPaletteStore()

    const supplementalViewType = computed(
      (): SupplementalViewType => {
        if (store.mode === 'search' && store.query.length > 0) {
          return 'search-result'
        }
        if (store.mode === 'search') {
          return 'search-suggestion'
        }
        return undefined
      }
    )

    return { closeCommandPalette, store, supplementalViewType }
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
