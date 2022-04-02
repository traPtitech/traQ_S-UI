import { computed } from 'vue'
import { buildFileThumbnailPath } from '/@/lib/apis'
import useFileMeta from './useFileMeta'
import { ThumbnailType } from '@traptitech/traq'
import type { ChannelId, FileId } from '/@/types/entity-ids'

const useFileThumbnail = (props: { fileId: FileId; channelId?: ChannelId }) => {
  const { fileMeta, fileLink, fileRawPath, canShow } = useFileMeta(props)
  const fileThumbnail = computed(() =>
    fileMeta.value?.thumbnails.find(t => t.type === ThumbnailType.Image)
  )

  const name = computed(() => fileMeta.value?.name ?? '')
  const fileThumbnailPath = computed(() =>
    fileMeta.value && fileThumbnail.value
      ? buildFileThumbnailPath(fileMeta.value.id)
      : fileRawPath.value
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
    fileLink,
    canShow,
    fileThumbnailPath,
    fileThumbnailSize,
    isAnimatedImage
  }
}

export default useFileThumbnail
