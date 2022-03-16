<template>
  <div ref="containerRef" :class="$style.container" :aria-selected="isSelected">
    <dropdown-suggester-user-icon
      v-if="candidate.type === 'user'"
      :user-id="candidate.id"
    />
    <a-stamp
      v-else-if="candidate.type === 'stamp'"
      :stamp-id="candidate.id"
      :size="24"
    />
    <dropdown-suggester-stamp-effect
      v-else-if="candidate.type === 'stamp-effect'"
      :effect-name-with-dot="candidate.text"
    />
    <div :class="$style.name">
      {{ candidate.text }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import DropdownSuggesterUserIcon from './DropdownSuggesterUserIcon.vue';
import AStamp from '/@/components/UI/AStamp.vue';
import DropdownSuggesterStampEffect from './DropdownSuggesterStampEffect.vue';
import { ref, watchEffect } from 'vue';
import { WordOrConfirmedPart } from '../composables/useWordSuggester'

const props = withDefaults(defineProps<{
    candidate: WordOrConfirmedPart,
    isSelected?: boolean
}>(), {
    isSelected: false
});

const containerRef = ref<HTMLDivElement>()
watchEffect(() => {
  if (!containerRef.value) return

  if (props.isSelected) {
    containerRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }
})
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
