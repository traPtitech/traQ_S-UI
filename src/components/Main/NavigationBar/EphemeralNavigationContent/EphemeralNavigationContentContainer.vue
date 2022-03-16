<template>
  <div :class="$style.container" :data-is-transparent="$boolAttr(transparent)">
    <slot />
  </div>
</template>

<script lang="ts" setup>


withDefaults(defineProps<{
    transparent?: boolean
}>(), {
    transparent: false
})


</script>

<style lang="scss" module>
.container {
  @include background-tertiary;
  width: 100%;
  height: 100%;
  border-top: {
    left-radius: 8px;
    right-radius: 8px;
  }
  &[data-is-transparent] {
    background: transparent;
  }
}
</style>
