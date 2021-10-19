import { Ref } from 'vue'
import { insert } from 'text-field-edit'

/**
 * これを利用したときはCtrl+Zなどがきく
 */
const useInsertText = (
  textareaRef: Ref<HTMLTextAreaElement | undefined>,
  target?: Ref<{ begin: number; end: number }>
) => {
  const insertText = (text: string) => {
    if (!textareaRef.value) return

    if (target) {
      textareaRef.value.selectionStart = target.value.begin
      textareaRef.value.selectionEnd = target.value.end
    }

    insert(textareaRef.value, text)
  }

  return { insertText }
}

export default useInsertText
