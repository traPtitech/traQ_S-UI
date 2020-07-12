import useStampPickerInvoker from '@/use/stampPickerInvoker'
import store from '@/store'
import { Ref, computed, SetupContext, nextTick } from '@vue/composition-api'

const useTextStampPickerInvoker = (
  targetPortalName: string,
  textState: { text: string },
  textareaRef: Ref<{ $el: HTMLTextAreaElement } | undefined>,
  context: SetupContext
) => {
  const elementRef = computed(() => textareaRef.value?.$el)

  const { invokeStampPicker } = useStampPickerInvoker(
    targetPortalName,
    async stampData => {
      const stampName = store.state.entities.stamps[stampData.id]?.name
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
  )

  return { invokeStampPicker }
}

export default useTextStampPickerInvoker
