<template>
  <button>
    <AIcon :class="$style.button" :size="size" mdi name="chevron-left" />
  </button>
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
  @include color-ui-primary;
}
</style>
