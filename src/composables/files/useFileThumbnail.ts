import { ThumbnailType } from '@traptitech/traq'

import { computed } from 'vue'

import { buildFileThumbnailPath } from '/@/lib/apis'
import type { ChannelId, FileId } from '/@/types/entity-ids'

import useFileMeta from './useFileMeta'

const useFileThumbnail = (props: { fileId: FileId; channelId?: ChannelId }) => {
  const { fileMeta, fileLink, fileRawPath, canShow } = useFileMeta(props)
  const fileThumbnail = computed(() =>
    fileMeta.value?.thumbnails.find(t => t.type === ThumbnailType.Image)
  )

  const name = computed(() => fileMeta.value?.name ?? '')
  const imageThumbnailPath = computed(() =>
    fileMeta.value && fileThumbnail.value
      ? buildFileThumbnailPath(fileMeta.value.id)
      : undefined
  )
  const fileThumbnailPath = computed(
    () => imageThumbnailPath.value ?? fileRawPath.value
  )
  const fileThumbnailSize = computed(() => ({
    height: fileThumbnail.value?.height,
    width: fileThumbnail.value?.width
  }))
  const isAnimatedImage = computed(
    () => fileMeta.value?.isAnimatedImage ?? false
  )
  return {
    name,
    fileMeta,
    fileLink,
    fileRawPath,
    canShow,
    fileThumbnailPath,
    fileThumbnail,
    imageThumbnailPath,
    fileThumbnailSize,
    isAnimatedImage
  }
}

export default useFileThumbnail
