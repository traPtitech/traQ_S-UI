<template>
  <button :class="$style.container" :aria-selected="isActive" @click="onClick">
    <a-icon name="effect" />
  </button>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue';

withDefaults(defineProps<{
    isActive?: boolean
}>(), {
    isActive: false
})

const emit = defineEmits<{
    (e: "click"): void
}>();

const onClick = () => {
  emit('click')
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 30px;
  border: {
    radius: 4px;
    width: 2px;
    style: solid;
    color: transparent;
  }
  opacity: 0.5;
  cursor: pointer;

  &[aria-selected='true'] {
    @include color-accent-primary;
    border-color: $theme-accent-primary-default;
  }
}
</style>
