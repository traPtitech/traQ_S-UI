import { FileId } from '/@/types/entity-ids'
import { computed } from 'vue'
import { buildFilePath } from '/@/lib/apis'
import { constructFilesPath } from '/@/router'

const useFileLink = (props: { fileId: FileId }) => {
  const fileLink = computed(() => constructFilesPath(props.fileId))
  const onFileDownloadLinkClick = () => {
    location.href = buildFilePath(props.fileId, true)
  }
  return { fileLink, onFileDownloadLinkClick }
}

export default useFileLink
