<template>
  <h2 :class="$style.header">
    {{ text }}
  </h2>
</template>

<script lang="ts" setup>
defineProps<{
  text: string
}>()
</script>

<style lang="scss" module>
.header {
  @include color-ui-secondary;
  @include size-body2;
  margin-bottom: 8px;
}
</style>
