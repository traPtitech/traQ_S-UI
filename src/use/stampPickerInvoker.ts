import store from '@/store'
import { StampSelectHandler } from '@/store/ui/stampPicker/state'

const useStampPickerInvoker = (
  targetPortalName: string,
  selectHandler: StampSelectHandler,
  position: { x: number; y: number } = { x: 0, y: 0 }
) => {
  const invokeStampPicker = () => {
    store.dispatch.ui.stampPicker.openMessageStampPicker({
      targetPortalName,
      selectHandler,
      position
    })
  }
  return {
    invokeStampPicker
  }
}

export default useStampPickerInvoker
