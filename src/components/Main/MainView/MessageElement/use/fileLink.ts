import { FileId } from '@/types/entity-ids'
import { computed, SetupContext } from '@vue/composition-api'
import { buildFilePath } from '@/lib/api'

const useFileLink = (props: { fileId: FileId }, context: SetupContext) => {
  const fileLink = computed(() => `/files/${props.fileId}`)
  const onFileLinkClick = () => {
    context.root.$router.push(fileLink.value)
  }
  const onFileDownloadLinkClick = () => {
    context.root.$router.push(buildFilePath(props.fileId))
  }
  return { fileLink, onFileLinkClick, onFileDownloadLinkClick }
}

export default useFileLink
