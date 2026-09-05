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
    <template v-if="candidate.type === 'user-group'">
      @<bdi>{{ candidate.text.slice(1) }}</bdi>
    </template>
    <template v-else>
      {{ display ?? candidate.text }}
    </template>
  </div>
</template>

<script lang="ts" setup>
import AStamp from '/@/components/UI/AStamp.vue'
import type { Word } from '/@/lib/suggestion/basic'

import DropdownSuggesterStampEffect from './DropdownSuggesterStampEffect.vue'
import DropdownSuggesterUserIcon from './DropdownSuggesterUserIcon.vue'

withDefaults(
  defineProps<{
    candidate: Word
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
