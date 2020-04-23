import { FileId } from '@/types/entity-ids'
import { computed, SetupContext } from '@vue/composition-api'
import { buildFilePath } from '@/lib/apis'

const useFileLink = (props: { fileId: FileId }, context: SetupContext) => {
  const fileLink = computed(() => `/files/${props.fileId}`)
  const onFileLinkClick = () => {
    context.root.$router.push(fileLink.value)
  }
  const onFileDownloadLinkClick = () => {
    window.open(buildFilePath(props.fileId), '_blank')
  }
  return { fileLink, onFileLinkClick, onFileDownloadLinkClick }
}

export default useFileLink
