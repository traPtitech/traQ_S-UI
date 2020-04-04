import { FileId } from '@/types/entity-ids'
import { computed } from '@vue/composition-api'

const useFileLink = (props: { fileId: FileId }) => {
  const fileLink = computed(() => `/files/${props.fileId}`)
  return { fileLink }
}

export default useFileLink
