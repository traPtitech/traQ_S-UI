<template>
  <div :class="$style.container">
    <div :class="$style.bar" :style="style" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(defineProps<{
    progress?: number
}>(), {
    progress: 0
});

const style = computed(() => ({
  transform: `translateX(-${(1 - props.progress) * 100}%)`
}))
</script>

<style lang="scss" module>
$input-border-width: 2px;
$input-border-radius: 4px;

.container {
  position: absolute;
  top: -$input-border-width;
  left: -$input-border-width;
  right: -$input-border-width;
  height: 8px;
  border-top-left-radius: $input-border-radius;
  border-top-right-radius: $input-border-radius;
  overflow: hidden;
}
.bar {
  height: 100%;
  width: 100%;
  background: $theme-ui-primary-background;
  opacity: 0.3;
  transition: transform 0.1s ease;
  will-change: transform;
}
</style>
