<template>
  <div :class="$style.container" @click="onClick">
    <span :class="$style.label">{{ label }}</span>
    <close-button
      :class="$style.closeIcon"
      :size="24"
      :inner-size="12"
      @close="removeHistorySuggestion(label)"
    />
  </div>
</template>

<script lang="ts">
import CloseButton from '@/components/UI/CloseButton.vue'
import { useCommandPaletteStore } from '@/providers/commandPalette'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SearchSuggestionHistoryItem',
  components: { CloseButton },
  props: {
    label: {
      type: String,
      required: true
    }
  },
  emits: {
    select: (label: string) => true //TODO 必要？
  },
  setup(props, context) {
    const { removeHistorySuggestion } = useCommandPaletteStore()
    const onClick = () => {
      context.emit('select', props.label)
    }
    return { onClick, removeHistorySuggestion }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  padding: 0.5rem 0 0.5rem 2rem;
  display: grid;
  grid-template-columns: 1fr 2.5rem;
  user-select: none;
  cursor: pointer;
  &:hover {
    @include background-secondary;
  }
}
.label {
  @include size-body1;
  @include color-ui-primary;
}
.closeIcon {
  @include color-ui-primary;
  height: 1.5rem;
}
.closeIcon {
  opacity: 0.5;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
}
</style>
