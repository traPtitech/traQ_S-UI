import store from '@/store'
import { StampSelectHandler } from '@/store/ui/stampPicker/state'

const useStampPickerInvoker = (
  targetPortalName: string,
  selectHandler: StampSelectHandler
) => {
  const invokeStampPicker = () => {
    store.dispatch.ui.stampPicker.showStampPicker({
      targetPortalName,
      selectHandler
    })
  }
  return {
    invokeStampPicker
  }
}

export default useStampPickerInvoker
