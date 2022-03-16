<template>
  <a-icon :size="size" mdi name="chevron-left" :class="$style.button" />
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

withDefaults(
  defineProps<{
    size?: number
  }>(),
  {
    size: 24
  }
)
</script>

<style lang="scss" module>
.button {
  cursor: pointer;
}
</style>
