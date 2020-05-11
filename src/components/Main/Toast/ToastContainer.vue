<template>
  <div :class="$style.container">
    <toast v-for="toast in toasts" :key="toast.id" :toast="toast" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
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
  flex-direction: column-reverse;
  pointer-events: none;
}
</style>
