<template>
  <div :class="$style.container">
    <a-icon :name="iconName" :mdi="iconMdi" :size="24" :title="toolName" />
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

withDefaults(
  defineProps<{
    toolName: string
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
  &:hover {
    @include color-ui-secondary;
  }
}
</style>
