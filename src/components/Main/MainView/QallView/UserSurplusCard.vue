<script setup lang="ts">
const { number } = defineProps<{
  number: number
}>()

const emit = defineEmits<{
  (e: 'switch'): void
}>()

const handleSwitch = () => {
  emit('switch')
}
</script>

<template>
  <div :class="$style.UserCard" @click="handleSwitch">
    <div :class="$style.NumberDisplay">+{{ number }}</div>
  </div>
</template>

<style lang="scss" module>
.UserCard {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background-color: $theme-ui-primary-default;
  pointer-events: auto;
  user-select: none;
  cursor: pointer;
}

.NumberDisplay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: black;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}
</style>
