import { type MaybeRefOrGetter, ref, toValue, watch } from 'vue'

import { useEventListener } from '@vueuse/core'

import { shouldAutoFocus } from '/@/lib/dom/browser'
import { insertText } from '/@/lib/dom/insertText'

const useInsertText = (
  textareaRef: MaybeRefOrGetter<HTMLTextAreaElement | undefined>,
  targetRef?: MaybeRefOrGetter<{ begin: number; end: number }>
) => {
  const isComposing = ref(false)

  watch(
    () => toValue(textareaRef),
    () => {
      isComposing.value = false
    }
  )
  useEventListener(textareaRef, 'compositionstart', () => {
    isComposing.value = true
  })
  useEventListener(textareaRef, 'compositionend', () => {
    isComposing.value = false
  })
  useEventListener(textareaRef, 'input', event => {
    if (event instanceof InputEvent && event.isComposing) {
      isComposing.value = true
    }
  })

  return {
    insertText: (text: string) => {
      const textarea = toValue(textareaRef)
      if (!textarea) return

      insertText(textarea, text, toValue(targetRef), {
        isComposing: isComposing.value,
        allowFocus: shouldAutoFocus()
      })
    }
  }
}

export default useInsertText
