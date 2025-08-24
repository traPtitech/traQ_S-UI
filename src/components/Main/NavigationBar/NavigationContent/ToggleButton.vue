<template>
  <button
    :class="$style.container"
    :title="title"
    :aria-pressed="modelValue"
    @click="toggle"
  >
    <a-icon :size="22" :class="$style.icon" :name="iconName" :mdi="iconMdi" />
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
  padding: 4px 28px;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  &:hover .icon,
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
