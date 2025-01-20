<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps({
  icon: {
    type: String,
    default: ''
  },
  onClick: {
    type: Function,
    default: null
  }
})
function handleClick() {
  if (props.onClick) props.onClick()
}
</script>
<template>
  <button class="call-control-btn" @click="handleClick">
    <img v-if="icon" :src="icon" alt="Call control" class="icon" />
  </button>
</template>
<style scoped lang="scss">
.call-control-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon {
  width: 24px;
  height: 24px;
}
</style>