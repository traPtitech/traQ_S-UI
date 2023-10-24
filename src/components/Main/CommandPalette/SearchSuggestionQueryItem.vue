<template>
  <div :class="$style.container" @click="onClick">
    <span :class="$style.description">{{ description }}</span>
    <span :class="$style.example">{{ example }}</span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  description: string
  example: string
}>()

const emit = defineEmits<{
  (e: 'select'): void
}>()

const onClick = () => {
  emit('select')
}
</script>

<style lang="scss" module>
.container {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  display: grid;
  grid-template-columns: 16rem 1fr;
  user-select: none;
  cursor: pointer;
  &:hover {
    @include background-secondary;
  }
}
.description {
  @include size-body1;
  @include color-ui-primary;
}
.example {
  @include size-body2;
  @include color-ui-secondary;
}
</style>
