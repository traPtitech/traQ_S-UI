<template>
  <button
    type="button"
    :class="$style.container"
    :data-selected="isSelected"
    :aria-label="
      candidate.type === 'user-group'
        ? candidateLabel(candidate, display)
        : (display ?? candidate.text)
    "
    :aria-description="candidateTypeLabel(candidate)"
  >
    <DropdownSuggesterUserIcon
      v-if="candidate.type === 'user'"
      :user-id="candidate.id"
    />

    <AStamp
      v-else-if="candidate.type === 'stamp'"
      :stamp-id="candidate.id"
      :size="24"
    />

    <DropdownSuggesterStampEffect
      v-else-if="candidate.type === 'stamp-effect'"
      :effect-name-with-dot="candidate.text"
      :content="preview"
    />

    <span :class="$style.name">
      <template v-if="candidate.type === 'user-group'">
        @<bdi>{{ candidate.text.slice(1) }}</bdi>
      </template>

      <template v-else>
        {{ display ?? candidate.text }}
      </template>
    </span>
  </button>
</template>

<script lang="ts" setup>
import AStamp from '/@/components/UI/AStamp.vue'
import {
  candidateLabel,
  candidateTypeLabel
} from '/@/lib/suggestion/candidatePresentation'
import type { SuggestionWord } from '/@/lib/suggestion/types'

import DropdownSuggesterStampEffect from './DropdownSuggesterStampEffect.vue'
import DropdownSuggesterUserIcon from './DropdownSuggesterUserIcon.vue'

withDefaults(
  defineProps<{
    candidate: SuggestionWord
    display?: string
    preview?: string
    isSelected?: boolean
  }>(),
  {
    isSelected: false
  }
)
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  color: inherit;
  text-align: left;
  padding: 4px;
  cursor: pointer;

  &[data-selected='true'],
  &:focus-visible,
  &:hover {
    @include background-secondary;
    font-weight: bold;
  }
}

.name {
  margin-left: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
