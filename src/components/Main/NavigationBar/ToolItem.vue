<template>
  <button :class="$style.container">
    <a-icon :name="iconName" :mdi="iconMdi" :size="24" />
  </button>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

withDefaults(
  defineProps<{
    iconName: string
    iconMdi?: boolean
  }>(),
  {
    iconMdi: false
  }
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary-inactive;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  &:hover,
  &:focus {
    @include color-ui-secondary;
  }
}
</style>
