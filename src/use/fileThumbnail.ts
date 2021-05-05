import { computed } from 'vue'
import { buildFileThumbnailPath } from '@/lib/apis'
import useFileMeta from './fileMeta'

const useFileThumbnail = (props: { fileId: string }) => {
  const { fileMeta, fileLink, fileRawPath } = useFileMeta(props)
  const name = computed(() => fileMeta.value?.name ?? '')
  const fileThumbnailPath = computed(() =>
    fileMeta.value && fileMeta.value.thumbnail !== null
      ? buildFileThumbnailPath(fileMeta.value.id)
      : fileRawPath.value
  )
  const fileThumbnailSize = computed(() => {
    const thumbnail =
      fileMeta.value && fileMeta.value.thumbnail !== null
        ? fileMeta.value.thumbnail
        : undefined
    return {
      height: thumbnail?.height,
      width: thumbnail?.width
    }
  })
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
