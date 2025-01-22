<script setup lang="ts">
import { defineProps, useCssModule } from 'vue'

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

const style = useCssModule()

function handleClick() {
  props.onClick?.()
}
</script>

<template>
  <button :class="style.callControlBtnSmall" @click="handleClick">
    <img v-if="icon" :src="icon" alt="Call control" :class="style.icon" />
  </button>
</template>

<style lang="scss" module>
.callControlBtnSmall {
  width: 40px;
  height: 40px;
  background-color: #222325;
  border: none;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s;
}

.callControlBtnSmall:hover {
  opacity: 0.1;
}

.icon {
  width: 32px;
  height: 32px;
  background-color: #222325;
  object-fit: cover;
}
</style>
