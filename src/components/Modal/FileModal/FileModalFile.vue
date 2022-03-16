<template>
  <div :class="$style.container">
    <file-modal-content-header :file-id="fileId" :class="$style.header" />
    <file-modal-content-footer :file-id="fileId" />
  </div>
</template>

<script lang="ts" setup>
import FileModalContentHeader from '/@/components/Modal/FileModal/FileModalContentHeader.vue'
import FileModalContentFooter from '/@/components/Modal/FileModal/FileModalContentFooter.vue'

defineProps<{
  fileId: string
}>()
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
