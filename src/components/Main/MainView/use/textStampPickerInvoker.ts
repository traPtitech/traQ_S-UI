import useStampPickerInvoker from '@/use/stampPickerInvoker'
import store from '@/store'

const useTextStampPickerInvoker = (
  targetPortalName: string,
  textState: { text: string }
) => {
  const { invokeStampPicker } = useStampPickerInvoker(
    targetPortalName,
    stampData => {
      const stampName = store.state.entities.stamps[stampData.id]?.name
      if (!stampName) return
      const size = stampData.size ? `.${stampData.size}` : ''
      const effects =
        stampData.effects && stampData.effects.length > 0
          ? `.${stampData.effects.join('.')}`
          : ''
      textState.text += `:${stampName}${size}${effects}:`
    }
  )

  return { invokeStampPicker }
}

export default useTextStampPickerInvoker
