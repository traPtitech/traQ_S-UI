import { ref } from 'vue'
import type { StampId } from '/@/types/entity-ids'

const useStampPreselector = () => {
  const preselected = ref<StampId>()
  const onHoverStamp = (id: string) => {
    preselected.value = id
  }

  return {
    preselected,
    onHoverStamp
  }
}

export default useStampPreselector
