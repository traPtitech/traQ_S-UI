<template>
  <div :class="$style.container">
    <div :class="$style.container">
      <div :class="$style.header">
        <file-modal-content-header :file-id="fileMeta.id" :is-white="true" />
      </div>
      <video
        controls
        draggable="false"
        :alt="fileMeta.name"
        :src="fileRawPath"
      />
      <div :class="$style.footer">
        <file-modal-content-footer :file-id="fileMeta.id" :is-white="true" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'
import FileModalContentHeader from '@/components/Modal/FileModal/FileModalContentHeader.vue'
import FileModalContentFooter from '@/components/Modal/FileModal/FileModalContentFooter.vue'

export default defineComponent({
  name: 'FileModalVideo',
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
  setup(props, context) {
    const { fileMeta, fileRawPath } = useFileMeta(props)
    return { fileMeta, fileRawPath }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-common-black;
  width: 100vw;
  height: 100vh;
  max-height: 100%;
  max-width: 60rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  video {
    display: block;
    max-width: 100%;
    min-height: 0;
  }
}
.header {
  width: 100%;
  backdrop-filter: blur(4px);
  z-index: $z-index-file-modal-header;
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;

  .container:hover & {
    opacity: 1;
  }
}
.footer {
  width: 100%;
  backdrop-filter: blur(4px);
  z-index: $z-index-file-modal-footer;
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;

  .container:hover & {
    opacity: 1;
  }
}
</style>
