<template>
  <div :class="$style.container">
    <transition-group name="toast-slide">
      <a-toast v-for="toast in toasts" :key="toast.id" :toast="toast" />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AToast from './AToast.vue'
import { useToastStore } from '/@/store/ui/toast'

export default defineComponent({
  name: 'ToastContainer',
  components: {
    AToast
  },
  setup() {
    const { toasts } = useToastStore()
    return { toasts }
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
