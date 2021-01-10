<template>
  <div :class="$style.container">
    <transition-group name="toast-slide">
      <toast v-for="toast in toasts" :key="toast.id" :toast="toast" />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Toast from './Toast.vue'
import useToastStore from '@/providers/toastStore'

export default defineComponent({
  name: 'ToastContainer',
  setup() {
    const { toasts } = useToastStore()
    return { toasts }
  },
  components: {
    Toast
  }
})
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
