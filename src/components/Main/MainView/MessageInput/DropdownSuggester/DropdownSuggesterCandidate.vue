<template>
  <div :class="$style.container" :aria-selected="isSelected">
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
    />
    <div :class="$style.name">
      {{ display ?? candidate.text }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import AStamp from '/@/components/UI/AStamp.vue'
import type { WordOrConfirmedPart } from '/@/lib/suggestion/basic'

import DropdownSuggesterStampEffect from './DropdownSuggesterStampEffect.vue'
import DropdownSuggesterUserIcon from './DropdownSuggesterUserIcon.vue'

withDefaults(
  defineProps<{
    candidate: WordOrConfirmedPart
    display?: string
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
  padding: 4px;
  cursor: pointer;
  &[aria-selected='true'],
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
