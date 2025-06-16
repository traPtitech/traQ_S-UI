<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <file-modal-content-header :file-id="fileMeta?.id ?? ''" is-white />
    </div>
    <image-viewer
      :class="$style.img"
      :src="fileRawPath"
      :alt="fileMeta?.name ?? 'unknown'"
    />
    <div :class="$style.footer">
      <file-modal-content-footer :file-id="fileMeta?.id ?? ''" is-white />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FileModalContentHeader from '/@/components/Modal/FileModal/FileModalContentHeader.vue'
import FileModalContentFooter from '/@/components/Modal/FileModal/FileModalContentFooter.vue'
import ImageViewer from '/@/components/UI/ImageViewer.vue'
import useFileMeta from '/@/composables/files/useFileMeta'

const props = defineProps<{
  fileId: string
}>()

const { fileMeta, fileRawPath } = useFileMeta(props)
</script>

<style lang="scss" module>
.container {
  @include background-common-black;
  position: relative;
  width: 100vw;
  height: 100%;
  max-height: 100%;
  max-width: 60rem;
}
.header {
  position: absolute;
  top: 0;
  width: 100%;
  backdrop-filter: blur(4px);
  z-index: $z-index-file-modal-header;
  opacity: 0;
  transition: all 0.2s ease;
  background: linear-gradient(to bottom, $common-background-black, transparent);

  .container:hover & {
    opacity: 1;
  }
}
.img {
  height: 100%;
  width: 100%;
}
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  backdrop-filter: blur(4px);
  z-index: $z-index-file-modal-footer;
  opacity: 0;
  transition: all 0.2s ease;
  background: linear-gradient(to top, $common-background-black, transparent);

  .container:hover & {
    opacity: 1;
  }
}
</style>
