<template>
  <ClickOutside stop @click-outside="clearModal">
    <div
      v-if="fileMeta"
      :class="$style.fileContainer"
      :data-fullsize="$boolAttr(isFullsizeModal)"
    >
      <FileModalImage v-if="fileType === 'image'" :file-id="fileMeta.id" />
      <FileModalVideo v-else-if="fileType === 'video'" :file-id="fileMeta.id" />
      <FileModalAudio v-else-if="fileType === 'audio'" :file-id="fileMeta.id" />
      <FileModalFile v-else :file-id="fileMeta.id" />
    </div>
  </ClickOutside>
</template>

<script lang="ts" setup>
import ClickOutside from '/@/components/UI/ClickOutside'
import FileModalImage from '/@/components/Modal/FileModal/FileModalImage.vue'
import FileModalFile from '/@/components/Modal/FileModal/FileModalFile.vue'
import FileModalVideo from '/@/components/Modal/FileModal/FileModalVideo.vue'
import FileModalAudio from '/@/components/Modal/FileModal/FileModalAudio.vue'
import { computed, reactive } from 'vue'
import useFileMeta from '/@/composables/files/useFileMeta'
import { useModalStore } from '/@/store/ui/modal'

const props = defineProps<{
  id: string
}>()

const fileIdState = reactive({
  fileId: computed(() => props.id)
})
const { fileMeta, fileType } = useFileMeta(fileIdState)
const { clearModal } = useModalStore()
const isFullsizeModal = computed(
  () => fileType.value === 'image' || fileType.value === 'video'
)
</script>

<style module lang="scss">
.fileContainer {
  height: auto;
  &[data-fullsize] {
    height: 100%;
  }
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
