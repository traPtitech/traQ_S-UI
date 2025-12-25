<template>
  <div :class="$style.container">
    <FileModalContentHeader :file-id="fileId" :class="$style.header" />
    <FileModalContentFooter :file-id="fileId" />
  </div>
</template>

<script lang="ts" setup>
import FileModalContentFooter from '/@/components/Modal/FileModal/FileModalContentFooter.vue'
import FileModalContentHeader from '/@/components/Modal/FileModal/FileModalContentHeader.vue'

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
