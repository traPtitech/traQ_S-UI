<template>
  <empty-state :class="$style.container"> Not Implemented </empty-state>
</template>

<script lang="ts" setup>
import EmptyState from '/@/components/UI/EmptyState.vue'
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
}
</style>
