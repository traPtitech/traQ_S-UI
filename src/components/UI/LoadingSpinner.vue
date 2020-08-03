<template>
  <div :class="$style.spinnerContainer">
    <div :class="$style.spinner" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoadingSpinner',
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
$size: 1.75em;
$spinner-width: 0.35em;

.spinnerContainer {
  display: flex;
  justify-content: center;
  align-items: center;
}
.spinner {
  position: relative;
  height: $size;
  width: $size;
  border: solid $spinner-width rgba(255, 255, 255);
  border-right: solid $spinner-width rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  animation: spinner 1s infinite linear;
  &::before {
    content: '';
    position: absolute;
    top: -$spinner-width;
    left: -$spinner-width;
    bottom: 0;
    right: 0;
    display: block;
    height: $size;
    width: $size;
    border: solid $spinner-width rgba(255, 255, 255);
    border-right: solid $spinner-width rgba(255, 255, 255, 0.25);
    border-radius: 50%;
    transform: rotate(60deg);
  }
}

@keyframes spinner {
  0% {
    transform: rotate(0turn);
  }
  100% {
    transform: rotate(1turn);
  }
}
</style>
