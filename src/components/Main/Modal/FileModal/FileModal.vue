<template>
  <div v-click-outside="onClickOutSide">
    <file-modal-image v-if="fileType === 'image'" :file-id="fileMeta.id" />
    <file-modal-video v-else-if="fileType === 'video'" :file-id="fileMeta.id" />
    <file-modal-audio v-else-if="fileType === 'audio'" :file-id="fileMeta.id" />
    <file-modal-file v-else :file-id="fileMeta.id" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from 'vue'
import useFileMeta from '@/use/fileMeta'
import store from '@/store'
import FileModalImage from '@/components/Main/Modal/FileModal/FileModalImage.vue'
import FileModalFile from '@/components/Main/Modal/FileModal/FileModalFile.vue'
import FileModalVideo from '@/components/Main/Modal/FileModal/FileModalVideo.vue'
import FileModalAudio from '@/components/Main/Modal/FileModal/FileModalAudio.vue'

export default defineComponent({
  name: 'FileModal',
  components: {
    FileModalImage,
    FileModalFile,
    FileModalVideo,
    FileModalAudio
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const fileIdState = reactive({
      fileId: computed(() => props.id)
    })
    const { fileMeta, fileType } = useFileMeta(fileIdState)
    const onClickOutSide = () => store.dispatch.ui.modal.clearModal()
    return { fileMeta, fileType, onClickOutSide }
  }
})
</script>
