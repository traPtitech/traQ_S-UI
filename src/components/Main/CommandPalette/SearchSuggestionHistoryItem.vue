<template>
  <div :class="$style.container" @click="onClick">
    <span :class="$style.label">{{ label }}</span>
    <icon
      name="close"
      mdi
      :class="$style.icon"
      :size="24"
      :inner-size="12"
      @click.stop="onClose"
    />
  </div>
</template>

<script lang="ts">
import Icon from '@/components/UI/Icon.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SearchSuggestionHistoryItem',
  components: { Icon },
  props: {
    label: {
      type: String,
      required: true
    }
  },
  emits: {
    select: (label: string) => true,
    remove: (label: string) => true
  },
  setup(props, context) {
    const onClick = () => {
      context.emit('select', props.label)
    }
    const onClose = () => {
      context.emit('remove', props.label)
    }
    return { onClick, onClose }
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
.icon {
  opacity: 0.5;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
}
</style>
