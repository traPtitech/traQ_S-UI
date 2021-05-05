import { computed } from 'vue'
import { buildFileThumbnailPath } from '@/lib/apis'
import useFileMeta from './fileMeta'
import { ThumbnailType } from '@traptitech/traq'

const useFileThumbnail = (props: { fileId: string }) => {
  const { fileMeta, fileLink, fileRawPath } = useFileMeta(props)
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
    fileThumbnailPath,
    fileThumbnailSize,
    isAnimatedImage
  }
}

export default useFileThumbnail
