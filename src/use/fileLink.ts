import { FileId } from '/@/types/entity-ids'
import { computed } from 'vue'
import { buildFilePath } from '/@/lib/apis'

const useFileLink = (props: { fileId: FileId }) => {
  const fileLink = computed(() => `/files/${props.fileId}`)
  const onFileDownloadLinkClick = () => {
    location.href = buildFilePath(props.fileId, true)
  }
  return { fileLink, onFileDownloadLinkClick }
}

export default useFileLink
