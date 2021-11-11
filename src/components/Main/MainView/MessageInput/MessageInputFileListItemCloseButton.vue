<template>
  <button :class="$style.container" @click="close">
    <a-icon mdi name="close-circle" :size="16" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'MessageInputFileListItemCloseButton',
  components: {
    AIcon
  },
  emits: {
    close: () => true
  },
  setup(props, { emit }) {
    const close = () => {
      emit('close')
    }
    return { close }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $theme-ui-primary;
  background: $theme-background-primary;
  cursor: pointer;
  z-index: $z-index-message-input-file-close-button;

  opacity: 0.5;
  &:hover {
    opacity: 0.8;
  }
}
</style>
