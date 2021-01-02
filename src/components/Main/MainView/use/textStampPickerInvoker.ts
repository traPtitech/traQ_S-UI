import {
  AlignmentPosition,
  StampSelectHandler,
  useStampPickerInvoker
} from '@/use/stampPicker'
import store from '@/store'
import { Ref, computed, nextTick } from 'vue'

const useTextStampPickerInvoker = (
  text: Ref<string>,
  textareaRef: Ref<{ $el: HTMLTextAreaElement } | undefined>,
  positionElement: Ref<HTMLElement | undefined>,
  positionOf: AlignmentPosition = 'bottom-right'
) => {
  const elementRef = computed(() => textareaRef.value?.$el)

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

    const pre = text.value.slice(0, elementRef.value.selectionStart)
    const suf = text.value.slice(elementRef.value.selectionEnd)
    const selectionIndex = pre.length + stampText.length
    text.value = `${pre}${stampText}${suf}`

    await nextTick()
    if (!textareaRef.value) return
    textareaRef.value.$el.selectionStart = textareaRef.value.$el.selectionEnd = selectionIndex
  }

  return useStampPickerInvoker(selecterHandler, positionElement, positionOf)
}

export default useTextStampPickerInvoker
