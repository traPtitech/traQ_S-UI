<template>
  <button
    type="button"
    :class="$style.container"
    :title="title"
    :aria-pressed="modelValue"
    @click="toggle"
  >
    <AIcon :size="22" :class="$style.icon" :name="iconName" :mdi="iconMdi" />
  </button>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

const modelValue = defineModel<boolean>({ default: false })

withDefaults(
  defineProps<{
    iconName: string
    iconMdi?: boolean
    title?: string
  }>(),
  {
    iconMdi: false
  }
)

const toggle = () => {
  modelValue.value = !modelValue.value
}
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  position: relative;
  isolation: isolate;
  padding: 4px 14px;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  &::after {
    @include background-accent-primary;
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    opacity: 0;
    pointer-events: none;
  }
  &[aria-pressed='true']::after {
    opacity: 0.2;
  }
  &:focus-visible {
    outline: 2px solid $theme-accent-focus-default;
    outline-offset: 2px;
  }
  &:focus-visible .icon {
    @include color-ui-secondary;
  }
}

.icon {
  @include color-ui-secondary-inactive;
  vertical-align: middle;
  .container[aria-pressed='true'] & {
    @include color-accent-primary;
  }
}
</style>
