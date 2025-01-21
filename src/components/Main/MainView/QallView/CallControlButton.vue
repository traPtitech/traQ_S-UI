<script setup lang="ts">
import { defineProps, computed, useCssModule } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: ''
  },
  onClick: {
    type: Function,
    default: null
  },
  isOn: {
    type: Boolean,
    required: true
  }
})

const style = useCssModule()

const buttonClass = computed(() => ({
  [style.callControlBtn]: true,
  [style.on]: props.isOn,
  [style.off]: !props.isOn
}))

function handleClick() {
  props.onClick?.()
}
</script>

<template>
  <button :class="buttonClass" @click="handleClick">
    <img v-if="icon" :src="icon" alt="Call control" />
  </button>
</template>

<style lang="scss" module>
.callControlBtn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.callControlBtn.on {
  background-color: white;
}

.callControlBtn.off {
  background-color: #49535b;
}

.callControlBtn:hover {
  opacity: 0.85;
}
</style>
