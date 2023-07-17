<template>
  <button :class="$style.container" @click="onClick">
    <span :class="$style.label">{{ label }}</span>
    <icon-button
      icon-name="close"
      icon-mdi
      :size="24"
      :class="$style.iconButton"
      @click.stop="onRemove"
    />
  </button>
</template>

<script lang="ts" setup>
import IconButton from '/@/components/UI/IconButton.vue'

const props = defineProps<{
  label: string
}>()

const emit = defineEmits<{
  (e: 'select', _label: string): void
  (e: 'remove', _label: string): void
}>()

const onClick = () => {
  emit('select', props.label)
}
const onRemove = () => {
  emit('remove', props.label)
}
</script>

<style lang="scss" module>
.container {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2rem;
  display: grid;
  grid-template-columns: 1fr min-content;
  user-select: none;
  cursor: pointer;
  &:hover,
  &:focus {
    @include background-secondary;
  }
}
.label {
  @include size-body1;
  @include color-ui-primary;
  word-break: break-all;
  text-align: left;
}
.iconButton {
  @include color-ui-primary-inactive;
  margin-left: 0.5rem;
  cursor: pointer;
  &:hover,
  &:focus {
    @include color-ui-primary;
  }
}
</style>
