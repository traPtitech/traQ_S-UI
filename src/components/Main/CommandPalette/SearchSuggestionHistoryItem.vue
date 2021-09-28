<template>
  <div :class="$style.container" @click="onClick">
    <span :class="$style.label">{{ label }}</span>
    <icon
      name="close"
      mdi
      :class="$style.icon"
      :size="24"
      @click.stop="onClose"
    />
  </div>
</template>

<script lang="ts">
import Icon from '/@/components/UI/Icon.vue'
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
    select: (_label: string) => true,
    remove: (_label: string) => true
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
  padding: 0.5rem 1rem 0.5rem 2rem;
  display: grid;
  grid-template-columns: 1fr min-content;
  user-select: none;
  cursor: pointer;
  &:hover {
    @include background-secondary;
  }
}
.label {
  @include size-body1;
  @include color-ui-primary;
  word-break: break-all;
}
.icon {
  margin-left: 0.5rem;
  opacity: 0.5;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
}
</style>
