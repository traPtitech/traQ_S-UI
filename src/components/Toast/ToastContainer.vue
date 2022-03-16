<template>
  <div :class="$style.container">
    <transition-group name="toast-slide">
      <a-toast v-for="toast in toasts" :key="toast.id" :toast="toast" />
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import AToast from './AToast.vue';
import { useToastStore } from '/@/store/ui/toast'

const { toasts } = useToastStore()
</script>

<style lang="scss" module>
.container {
  position: absolute;
  left: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  z-index: $z-index-toast-container;
  contain: layout;
}
</style>
