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
    window.open(buildFilePath(props.fileId), '_blank')
  }
  return { fileLink, onFileLinkClick, onFileDownloadLinkClick }
}

export default useFileLink
