import { FileId } from '/@/types/entity-ids'
import { computed } from 'vue'
import { buildFilePath } from '/@/lib/apis'
import router from '/@/router'

const useFileLink = (props: { fileId: FileId }) => {
  const fileLink = computed(() => `/files/${props.fileId}`)
  const onFileLinkClick = () => {
    router.push(fileLink.value)
  }
  const onFileDownloadLinkClick = () => {
    location.href = buildFilePath(props.fileId, true)
  }
  return { fileLink, onFileLinkClick, onFileDownloadLinkClick }
}

export default useFileLink
