import { computed } from 'vue'
import store from '@/store'
import { buildFilePath } from '@/lib/apis'
import { mimeToFileType, prettifyFileSize } from '@/lib/util/file'
import useFileLink from '@/use/fileLink'

const useFileMeta = (props: { fileId: string }) => {
  const fileMeta = computed(() =>
    store.state.entities.messages.fileMetaDataMap.get(props.fileId)
  )
  const { fileLink, onFileDownloadLinkClick, onFileLinkClick } =
    useFileLink(props)
  const fileRawPath = computed(() =>
    fileMeta.value ? buildFilePath(fileMeta.value.id) : ''
  )
  const fileType = computed(() =>
    fileMeta.value ? mimeToFileType(fileMeta.value.mime) : 'file'
  )
  const isAnimatedImage = computed(
    () => fileMeta.value?.isAnimatedImage ?? false
  )
  const fileSize = computed(() =>
    fileMeta.value ? prettifyFileSize(fileMeta.value.size) : '0B'
  )
  return {
    fileMeta,
    fileLink,
    fileRawPath,
    fileType,
    isAnimatedImage,
    fileSize,
    onFileLinkClick,
    onFileDownloadLinkClick
  }
}

export default useFileMeta
