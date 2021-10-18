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

    // Windowsでの\r\nを含む文字列を貼り付けた後に
    // Ctrl+Zでアンドゥすると、キャレットの位置がずれるので
    // ずれないように\nに統一しておく
    const normalizedText = text.replace(/\r\n/g, '\n')
    insert(textareaRef.value, normalizedText)
  }

  return { insertText }
}

export default useInsertText
