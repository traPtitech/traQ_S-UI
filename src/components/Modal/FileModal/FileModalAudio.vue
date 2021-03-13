<template>
  <div :class="$style.container">
    <file-modal-content-header :file-id="fileMeta.id" :class="$style.header" />
    <audio
      controls
      :alt="fileMeta.name"
      :src="fileRawPath"
      :class="$style.audio"
    />
    <file-modal-content-footer :file-id="fileMeta.id" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'
import FileModalContentHeader from '@/components/Modal/FileModal/FileModalContentHeader.vue'
import FileModalContentFooter from '@/components/Modal/FileModal/FileModalContentFooter.vue'

export default defineComponent({
  name: 'FileModalAudio',
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
.audio {
  margin: 16px 0;
  width: 80%;
}
</style>
