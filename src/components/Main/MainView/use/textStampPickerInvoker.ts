import {
  AlignmentPosition,
  StampSelectHandler,
  useStampPickerInvoker
} from '/@/providers/stampPicker'
import store from '/@/store'
import { Ref } from 'vue'
import useInsertText from '/@/use/insertText'

const useTextStampPickerInvoker = (
  text: Ref<string>,
  textareaRef: Ref<HTMLTextAreaElement | undefined>,
  positionElement: Ref<HTMLElement | undefined>,
  positionOf: AlignmentPosition = 'bottom-right'
) => {
  const { insertText } = useInsertText(textareaRef)

  const selecterHandler: StampSelectHandler = stampData => {
    const stampName = store.state.entities.stampsMap.get(stampData.id)?.name
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
