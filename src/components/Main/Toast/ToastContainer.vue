<template>
  <div :class="$style.container">
    <transition-group name="toast-slide">
      <toast v-for="toast in toasts" :key="toast.id" :toast="toast" />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import store from '@/_store'
import Toast from './Toast.vue'

export default defineComponent({
  name: 'ToastContainer',
  setup() {
    const toasts = computed(() => store.state.ui.toast.toasts)
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
