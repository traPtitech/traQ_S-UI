import {
  AlignmentPosition,
  StampSelectHandler,
  useStampPickerInvoker
} from '/@/providers/stampPicker'
import store from '/@/store'
import { Ref, computed } from 'vue'
import useInsertText from '/@/use/insertText'

const useTextStampPickerInvoker = (
  text: Ref<string>,
  textareaRef: Ref<{ $el: HTMLTextAreaElement } | undefined>,
  positionElement: Ref<HTMLElement | undefined>,
  positionOf: AlignmentPosition = 'bottom-right'
) => {
  const elementRef = computed(() => textareaRef.value?.$el)
  const { insertText } = useInsertText(text, elementRef)

  const selecterHandler: StampSelectHandler = async stampData => {
    const stampName = store.state.entities.stampsMap.get(stampData.id)?.name
    if (!stampName) return
    const size = stampData.size ? `.${stampData.size}` : ''
    const effects =
      stampData.effects && stampData.effects.length > 0
        ? `.${stampData.effects.join('.')}`
        : ''
    const stampText = `:${stampName}${size}${effects}:`

    if (!elementRef.value) {
      text.value += stampText
      return
    }

    insertText(stampText)
  }

  return useStampPickerInvoker(selecterHandler, positionElement, positionOf)
}

export default useTextStampPickerInvoker
