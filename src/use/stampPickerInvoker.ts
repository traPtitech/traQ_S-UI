import store from '@/store'
import { StampSelectHandler } from '@/store/ui/stampPicker/state'
import { Place } from '@/store/ui/stampPicker'

const useStampPickerInvoker = (
  targetPortalName: string,
  selectHandler: StampSelectHandler
) => {
  const invokeStampPicker = (position?: Place) => {
    store.dispatch.ui.stampPicker.openStampPicker({
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
