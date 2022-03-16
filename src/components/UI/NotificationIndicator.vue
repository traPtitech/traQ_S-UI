<template>
  <indicator-dot
    :class="$style.container"
    :size="size"
    :border-width="borderWidth"
  />
</template>

<script lang="ts" setup>
import IndicatorDot from './IndicatorDot.vue';

withDefaults(defineProps<{
    size?: number,
    borderWidth?: number
}>(), {
    size: 10,
    borderWidth: 0
})


</script>

<style lang="scss" module>
.container {
  background: $theme-accent-notification-background;
  border-color: $theme-background-secondary-border;
}
</style>
