<template>
  <icon-button
    :class="$style.container"
    title="プレビュー表示"
    icon-name="markdown"
    :data-is-enabled="modelValue"
    @click="toggle"
  />
</template>

<script lang="ts" setup>
import IconButton from '/@/components/UI/IconButton.vue'

const modelValue = defineModel<boolean>({ required: true })

const toggle = () => {
  modelValue.value = !modelValue.value
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  transform: scale(1);
  transition: transform 0.1s;
  &:hover {
    transform: scale(1.1);
  }
  &[data-is-enabled='true'] {
    @include color-accent-primary;
  }
}
</style>
