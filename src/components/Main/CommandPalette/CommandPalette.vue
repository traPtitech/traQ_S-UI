<template>
  <click-outside stop @click-outside="closeCommandPalette">
    <div :class="$style.container" :data-is-mobile="$boolAttr(isMobile)">
      <command-palette-input />
      <hr v-if="supplementalViewType" :class="$style.separator" />
      <search-result v-if="supplementalViewType === 'search-result'" />
      <search-suggestion
        v-else-if="supplementalViewType === 'search-suggestion'"
      />
    </div>
  </click-outside>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useCommandPaletteStore } from '/@/providers/commandPalette'
import ClickOutside from '/@/components/UI/ClickOutside'
import CommandPaletteInput from './CommandPaletteInput.vue'
import SearchResult from './SearchResult.vue'
import SearchSuggestion from './SearchSuggestion.vue'
import { useResponsiveStore } from '/@/store/ui/responsive'

type SupplementalViewType = 'search-result' | 'search-suggestion' | undefined

export default defineComponent({
  name: 'CommandPalette',
  components: {
    ClickOutside,
    CommandPaletteInput,
    SearchResult,
    SearchSuggestion
  },
  setup() {
    const { isMobile } = useResponsiveStore()
    const { closeCommandPalette, commandPaletteStore: store } =
      useCommandPaletteStore()

    const supplementalViewType = computed((): SupplementalViewType => {
      if (store.mode === 'search' && store.query.length > 0) {
        return 'search-result'
      }
      if (store.mode === 'search') {
        return 'search-suggestion'
      }
      return undefined
    })

    return { isMobile, closeCommandPalette, store, supplementalViewType }
  }
})
</script>

<style lang="scss" module>
$command-palette-max-width: min(1000px, calc(100vw - 16px));
.container {
  @include background-primary;
  display: grid;
  grid-template-rows: min-content 2px 1fr;
  width: 100%;

  &:not([data-is-mobile]) {
    max-width: $command-palette-max-width;
    max-height: calc(100vh - 56px);
    margin: 32px auto 24px auto;
    border-radius: 8px;
    border: 2px solid $theme-background-secondary-border;
  }
  &[data-is-mobile] {
    height: 100%;
  }
}
.separator {
  @include background-secondary;
  border: none;
  margin: 0;
}
</style>
