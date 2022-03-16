<template>
  <click-outside stop @click-outside="clearModal">
    <div v-if="fileMeta">
      <file-modal-image v-if="fileType === 'image'" :file-id="fileMeta.id" />
      <file-modal-video
        v-else-if="fileType === 'video'"
        :file-id="fileMeta.id"
      />
      <file-modal-audio
        v-else-if="fileType === 'audio'"
        :file-id="fileMeta.id"
      />
      <file-modal-file v-else :file-id="fileMeta.id" />
    </div>
  </click-outside>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from 'vue'
import useFileMeta from '/@/composables/useFileMeta'
import ClickOutside from '/@/components/UI/ClickOutside'
import FileModalImage from '/@/components/Modal/FileModal/FileModalImage.vue'
import FileModalFile from '/@/components/Modal/FileModal/FileModalFile.vue'
import FileModalVideo from '/@/components/Modal/FileModal/FileModalVideo.vue'
import FileModalAudio from '/@/components/Modal/FileModal/FileModalAudio.vue'
import { useModalStore } from '/@/store/ui/modal'

export default defineComponent({
  name: 'FileModal',
  components: {
    ClickOutside,
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
    const { clearModal } = useModalStore()
    return { fileMeta, fileType, clearModal }
  }
})
</script>
