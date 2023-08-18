<template>
  <button :class="$style.button">
    {{ props.label }}
  </button>
</template>

<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'

interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {
  label: string
}
const props = defineProps<Props>()
</script>

<style lang="scss" module>
.button {
  padding: 0.25rem 1rem;
  cursor: pointer;
  position: relative;
  @include color-ui-secondary;

  &[aria-selected='true'] {
    @include color-accent-primary;
  }
  &::after {
    content: '';
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: -1;
    opacity: 0;
    border-radius: 100vw;
  }
  &[aria-selected='true']::after {
    opacity: 0.1;
    @include background-accent-primary;
  }
  &[aria-selected='false']:hover::after {
    opacity: 1;
    @include background-tertiary;
  }
}
</style>
