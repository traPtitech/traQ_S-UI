<script setup lang="ts">
import AIcon from '/@/components/UI/AIcon.vue'

const props = defineProps({
  onClick: {
    type: Function,
    required: true
  }
})

function handleClick() {
  props.onClick?.()
}
</script>

<template>
  <button :class="$style.detailButton" @click="handleClick">
    <AIcon name="plus-circle" mdi :size="24" />
  </button>
</template>

<style lang="scss" module>
.detailButton {
  position: absolute;
  bottom: -6px;
  right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: $theme-background-primary-default;
  width: 24px;
  height: 24px;
}
</style>
