import {
  AlignmentPosition,
  StampSelectHandler,
  useStampPickerInvoker
} from '/@/store/ui/stampPicker'
import { Ref } from 'vue'
import useInsertText from '/@/composables/useInsertText'
import { useStampsStore } from '/@/store/entities/stamps'

const useTextStampPickerInvoker = (
  text: Ref<string>,
  textareaRef: Ref<HTMLTextAreaElement | undefined>,
  positionElement: Ref<HTMLElement | undefined>,
  positionOf: AlignmentPosition = 'bottom-right'
) => {
  const { stampsMap } = useStampsStore()
  const { insertText } = useInsertText(textareaRef)

  const selecterHandler: StampSelectHandler = stampData => {
    const stampName = stampsMap.value.get(stampData.id)?.name
    if (!stampName) return
    const size = stampData.size ? `.${stampData.size}` : ''
    const effects =
      stampData.effects && stampData.effects.length > 0
        ? `.${stampData.effects.join('.')}`
        : ''
    const stampText = `:${stampName}${size}${effects}:`

    if (!textareaRef.value) {
      text.value += stampText
      return
    }

    insertText(stampText)
  }

  return useStampPickerInvoker(selecterHandler, positionElement, positionOf)
}

export default useTextStampPickerInvoker
