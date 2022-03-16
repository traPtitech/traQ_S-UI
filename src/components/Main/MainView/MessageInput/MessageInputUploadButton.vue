<template>
  <icon-button
    :class="$style.container"
    title="ファイルを添付する"
    icon-mdi
    icon-name="plus-circle-outline"
    :disabled="disabled"
  />
</template>

<script lang="ts" setup>
import IconButton from '/@/components/UI/IconButton.vue';

withDefaults(defineProps<{
    disabled?: boolean
}>(), {
    disabled: false
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  transform: scale(1);
  transition: transform 0.1s;
  &[aria-disabled='false']:hover {
    transform: scale(1.1);
  }
  &[aria-disabled='true'] {
    @include color-ui-secondary-inactive;
  }
}
</style>
