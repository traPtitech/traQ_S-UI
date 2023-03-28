<template>
  <click-outside
    stop
    unable-while-modal-open
    @click-outside="closeCommandPalette"
  >
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

<script lang="ts" setup>
import { computed } from 'vue'
import { useCommandPalette } from '/@/store/app/commandPalette'
import { useResponsiveStore } from '/@/store/ui/responsive'
import ClickOutside from '/@/components/UI/ClickOutside'
import CommandPaletteInput from './CommandPaletteInput.vue'
import SearchResult from './SearchResult.vue'
import SearchSuggestion from './SearchSuggestion.vue'

const { isMobile } = useResponsiveStore()
const { mode, query, closeCommandPalette } = useCommandPalette()

type SupplementalViewType = 'search-result' | 'search-suggestion' | undefined

const supplementalViewType = computed((): SupplementalViewType => {
  if (mode.value === 'search' && query.value.length > 0) {
    return 'search-result'
  }
  if (mode.value === 'search') {
    return 'search-suggestion'
  }
  return undefined
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
