<template>
  <div :class="$style.container">
    <file-modal-content-header :file-id="fileId" :class="$style.header" />
    <file-modal-content-footer :file-id="fileId" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FileModalContentHeader from '/@/components/Modal/FileModal/FileModalContentHeader.vue'
import FileModalContentFooter from '/@/components/Modal/FileModal/FileModalContentFooter.vue'

export default defineComponent({
  name: 'FileModalFile',
  components: {
    FileModalContentHeader,
    FileModalContentFooter
  },
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  position: relative;
  width: 100vw;
  max-width: 40rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 12px 16px;
}
.header {
  margin-bottom: 12px;
}
</style>
