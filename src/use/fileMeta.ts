import { computed, SetupContext } from 'vue'
import store from '@/store'
import { buildFilePath, buildFileThumbnailPath } from '@/lib/apis'
import { mimeToFileType, prettifyFileSize } from '@/lib/util/file'
import useFileLink from '@/use/fileLink'

const useFileMeta = (props: { fileId: string }, context: SetupContext) => {
  const fileMeta = computed(
    () => store.state.entities.fileMetaData[props.fileId]
  )
  const { fileLink, onFileDownloadLinkClick, onFileLinkClick } = useFileLink(
    props,
    context
  )
  const fileRawPath = computed(() =>
    fileMeta.value ? buildFilePath(fileMeta.value.id) : ''
  )
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
  const fileType = computed(() =>
    fileMeta.value ? mimeToFileType(fileMeta.value.mime) : 'file'
  )
  const fileSize = computed(() =>
    fileMeta.value ? prettifyFileSize(fileMeta.value.size) : '0B'
  )
  return {
    fileMeta,
    fileLink,
    fileRawPath,
    fileThumbnailPath,
    fileThumbnailSize,
    fileType,
    fileSize,
    onFileLinkClick,
    onFileDownloadLinkClick
  }
}

export default useFileMeta
