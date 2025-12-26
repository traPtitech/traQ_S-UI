import { type MaybeRefOrGetter, toValue } from 'vue'

import { insertText } from '/@/lib/dom/insertText'
import { useResponsiveStore } from '/@/store/ui/responsive'

const useInsertText = (
  textareaRef: MaybeRefOrGetter<HTMLTextAreaElement | undefined>,
  targetRef?: MaybeRefOrGetter<{ begin: number; end: number }>
) => {
  const { isMobile } = useResponsiveStore()

  return {
    insertText: (text: string) => {
      const textarea = toValue(textareaRef)
      if (!textarea) return

      insertText(textarea, text, toValue(targetRef), isMobile.value)
    }
  }
}

export default useInsertText
