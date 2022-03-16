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

<script lang="ts">
import { defineComponent, PropType, ref, watchEffect } from 'vue'
import { WordOrConfirmedPart } from '../composables/useWordSuggester'
import DropdownSuggesterUserIcon from './DropdownSuggesterUserIcon.vue'
import AStamp from '/@/components/UI/AStamp.vue'
import DropdownSuggesterStampEffect from './DropdownSuggesterStampEffect.vue'

export default defineComponent({
  name: 'DropdownSuggesterCandidate',
  components: {
    DropdownSuggesterUserIcon,
    AStamp,
    DropdownSuggesterStampEffect
  },
  props: {
    candidate: {
      type: Object as PropType<WordOrConfirmedPart>,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
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

    return { containerRef }
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
