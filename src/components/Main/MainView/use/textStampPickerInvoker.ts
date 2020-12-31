import {
  PositionOf,
  StampSelectHandler,
  useStampPickerInvoker
} from '@/use/stampPicker'
import store from '@/store'
import { Ref, computed, nextTick } from 'vue'

const useTextStampPickerInvoker = (
  textState: { text: string },
  textareaRef: Ref<{ $el: HTMLTextAreaElement } | undefined>,
  positionElement: Ref<HTMLElement | undefined>,
  positionOf: PositionOf = 'bottom-right'
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
      textState.text += stampText
      return
    }

    const pre = textState.text.slice(0, elementRef.value.selectionStart)
    const suf = textState.text.slice(elementRef.value.selectionEnd)
    const selectionIndex = pre.length + stampText.length
    textState.text = `${pre}${stampText}${suf}`

    await nextTick()
    if (!textareaRef.value) return
    textareaRef.value.$el.selectionStart = textareaRef.value.$el.selectionEnd = selectionIndex
  }

  return useStampPickerInvoker(selecterHandler, positionElement, positionOf)
}

export default useTextStampPickerInvoker
