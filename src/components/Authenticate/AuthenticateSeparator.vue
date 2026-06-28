<template>
  <div :class="$style.container">
    <span :class="$style.hr" />
    <span v-if="label !== ''" :class="$style.label">
      {{ label }}
    </span>
    <span :class="$style.hr" />
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: ''
  }
)
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}
.hr {
  @include background-tertiary;
  width: 100%;
  height: 2px;
}
.label {
  @include color-ui-secondary;
  margin: 0 16px;
  flex-shrink: 0;
  font-weight: bold;
}
</style>
