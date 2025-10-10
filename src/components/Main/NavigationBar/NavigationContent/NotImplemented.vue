<template>
  <EmptyState :class="$style.container"> Not Implemented </EmptyState>
</template>

<script lang="ts" setup>
import EmptyState from '/@/components/UI/EmptyState.vue'
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
}
</style>
