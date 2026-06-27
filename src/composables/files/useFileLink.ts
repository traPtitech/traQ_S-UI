import { computed } from 'vue'

import { buildFilePath } from '/@/lib/apis'
import { constructFilesPath } from '/@/router'
import type { FileId } from '/@/types/entity-ids'

const useFileLink = (props: { fileId: FileId }) => {
  const fileLink = computed(() => constructFilesPath(props.fileId))
  const onFileDownloadLinkClick = () => {
    location.href = buildFilePath(props.fileId)
  }
  return { fileLink, onFileDownloadLinkClick }
}

export default useFileLink
