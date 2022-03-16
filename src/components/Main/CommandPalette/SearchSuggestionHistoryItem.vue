<template>
  <div :class="$style.container" @click="onClick">
    <span :class="$style.label">{{ label }}</span>
    <a-icon
      name="close"
      mdi
      :class="$style.icon"
      :size="24"
      @click.stop="onClose"
    />
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

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
const onClose = () => {
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
  @include color-ui-primary-inactive;
  margin-left: 0.5rem;
  cursor: pointer;
  &:hover {
    @include color-ui-primary;
  }
}
</style>
