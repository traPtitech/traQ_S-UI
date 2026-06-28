<template>
  <transition name="fade-top">
    <div v-if="show" :class="$style.bar" />
  </transition>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    show?: boolean
  }>(),
  {
    show: false
  }
)
</script>

<style lang="scss" module>
.bar {
  background:
    linear-gradient(0, $theme-ui-primary-default, $theme-ui-primary-default),
    linear-gradient(45deg, #ccc, #444, #ccc);
  background-blend-mode: color;
  background-size: 400% 100%;
  animation: scroll-loading 3s ease infinite;
  opacity: 0.5;
  pointer-events: none;
}

@keyframes scroll-loading {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
