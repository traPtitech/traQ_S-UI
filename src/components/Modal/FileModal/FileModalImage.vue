<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <FileModalContentHeader :file-id="fileMeta?.id ?? ''" is-white />
    </div>

    <div
      v-if="siblingImageIds.length > 1"
      :class="[$style.navButton, $style.navLeft]"
      @click.stop="prevFile"
    >
      <AIcon name="chevron-left" mdi :size="32" />
    </div>

    <ImageViewer
      :class="$style.img"
      :src="fileRawPath"
      :alt="fileMeta?.name ?? 'unknown'"
    />

    <div
      v-if="siblingImageIds.length > 1"
      :class="[$style.navButton, $style.navRight]"
      @click.stop="nextFile"
    >
      <AIcon name="chevron-right" mdi :size="32" />
    </div>

    <div :class="$style.footer">
      <FileModalContentFooter :file-id="fileMeta?.id ?? ''" is-white />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

import { useEventListener } from '@vueuse/core'

import FileModalContentFooter from '/@/components/Modal/FileModal/FileModalContentFooter.vue'
import FileModalContentHeader from '/@/components/Modal/FileModal/FileModalContentHeader.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import ImageViewer from '/@/components/UI/ImageViewer.vue'
import useFileMeta from '/@/composables/files/useFileMeta'
import { buildFilePath } from '/@/lib/apis'
import { safeMod } from '/@/lib/basic/arithmetic'
import { isImage } from '/@/lib/basic/file'
import { isFile } from '/@/lib/guard/embeddingOrUrl'
import { constructFilesPath } from '/@/router'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useMessagesStore } from '/@/store/entities/messages'

const props = defineProps<{
  fileId: string
}>()

const { fileMeta, fileRawPath } = useFileMeta(props)

const router = useRouter()
const { embeddingsMap } = useMessagesView()
const { fileMetaDataMap } = useMessagesStore()

const siblingImageIds = computed(() => {
  for (const embeddings of embeddingsMap.value.values()) {
    const fileIds = embeddings.filter(isFile).map(e => e.id)
    if (fileIds.includes(props.fileId)) {
      return fileIds.filter(id => {
        const meta = fileMetaDataMap.value.get(id)
        return meta && isImage(meta.mime)
      })
    }
  }
  return [props.fileId]
})

watchEffect(() => {
  siblingImageIds.value.forEach(id => {
    if (id !== props.fileId) {
      // Preload
      const img = new Image()
      img.src = buildFilePath(id)
    }
  })
})

const currentIndex = computed(() => siblingImageIds.value.indexOf(props.fileId))

const moveFile = (index: number) => {
  if (currentIndex.value === -1 || siblingImageIds.value.length <= 1) return

  router.replace(
    constructFilesPath(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      siblingImageIds.value[
        safeMod(currentIndex.value + index, siblingImageIds.value.length)
      ]!
    )
  )
}

const nextFile = () => moveFile(1)
const prevFile = () => moveFile(-1)

const onKeyDown = (e: KeyboardEvent) => {
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  ) {
    return
  }
  if (e.key === 'ArrowRight') {
    nextFile()
  } else if (e.key === 'ArrowLeft') {
    prevFile()
  }
}

useEventListener('keydown', onKeyDown)
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
.navButton {
  @include color-ui-secondary;

  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: $z-index-file-modal-header;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;

  .container:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.6);
  }
}
.navLeft {
  left: 4px;
}
.navRight {
  right: 4px;
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
