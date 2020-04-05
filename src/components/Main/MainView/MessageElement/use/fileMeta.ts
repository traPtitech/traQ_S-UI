import { computed, SetupContext } from '@vue/composition-api'
import store from '@/store'
import { buildFilePath } from '@/lib/api'
import { mimeToFileType, prettifyFileSize } from '@/lib/util/file'
import useFileLink from './fileLink'

const useFileMeta = (props: { fileId: string }, context: SetupContext) => {
  const fileMeta = computed(
    () => store.state.entities.fileMetaData[props.fileId]
  )
  const { fileLink, onFileDownloadLinkClick, onFileLinkClick } = useFileLink(
    props,
    context
  )
  const fileRawPath = computed(() => buildFilePath(fileMeta.value.id))
  const fileType = computed(() => mimeToFileType(fileMeta.value.mime))
  const fileSize = computed(() => prettifyFileSize(fileMeta.value.size))
  const fileIconName = computed(() =>
    fileType.value === 'file' ? 'file' : `file-${fileType.value}`
  )
  return {
    fileMeta,
    fileLink,
    fileRawPath,
    fileSize,
    fileIconName,
    onFileLinkClick,
    onFileDownloadLinkClick
  }
}

export default useFileMeta
