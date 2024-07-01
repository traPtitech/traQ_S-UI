<template>
  <div
    :class="$style.container"
    :data-is-mobile="$boolAttr(isMobile)"
    @click="onClick"
  >
    <p :class="$style.description">{{ description }}</p>
    <p :class="$style.example">{{ example }}</p>
  </div>
</template>

<script lang="ts" setup>
import { useResponsiveStore } from '/@/store/ui/responsive'
defineProps<{
  description: string
  example: string
}>()

const { isMobile } = useResponsiveStore()

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

  &[data-is-mobile] {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
}
.description {
  @include size-body1;
  @include color-ui-primary;
}
.example {
  @include size-body2;
  @include color-ui-secondary;
  margin-left: 12px;
}
</style>
