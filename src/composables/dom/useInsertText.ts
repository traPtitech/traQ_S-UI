import { type MaybeRefOrGetter, toValue } from 'vue'

import useResponsive from '/@/composables/useResponsive'
import { isTouchDevice } from '/@/lib/dom/browser'
import { insertText } from '/@/lib/dom/insertText'

const useInsertText = (
  textareaRef: MaybeRefOrGetter<HTMLTextAreaElement | undefined>,
  targetRef?: MaybeRefOrGetter<{ begin: number; end: number }>
) => {
  const { isMobile } = useResponsive()

  return {
    insertText: (text: string) => {
      const textarea = toValue(textareaRef)
      if (!textarea) return

      insertText(
        textarea,
        text,
        toValue(targetRef),
        isMobile.value || isTouchDevice()
      )
    }
  }
}

export default useInsertText
