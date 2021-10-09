<template>
  <div :class="$style.typingAnimation">
    <div />
    <div />
    <div />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MessageInputTypingAnimation'
})
</script>

<style lang="scss" module>
.typingAnimation {
  display: flex;
  align-items: center;
  height: 20px;
  > * {
    width: 6px;
    height: 6px;
    margin: 0 2px;
    background: $theme-text-secondary;
    border-radius: 50%;
    transform: scale(0);
    animation: typing-ani 0.9s ease-in-out infinite;

    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }

    &:nth-child(1) {
      animation-delay: 0s;
    }
    &:nth-child(2) {
      animation-delay: 0.3s;
    }
    &:nth-child(3) {
      animation-delay: 0.6s;
    }
  }
}

@keyframes typing-ani {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
</style>
