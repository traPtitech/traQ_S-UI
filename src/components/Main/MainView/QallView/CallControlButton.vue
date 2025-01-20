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
  <button :class="$style.callControlBtn" @click="handleClick">
    <img v-if="icon" :src="icon" alt="Call control"/>
  </button>
  <div :class="$style.test">test</div>
</template>

<style lang="scss" module>
.callControlBtn {
  width: 64px;
  height: 64px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.test{
	color: blue;
}
</style>