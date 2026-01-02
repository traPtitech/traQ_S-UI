import { type MaybeRefOrGetter, type Ref, toValue } from 'vue'

import { insert } from 'text-field-edit'

const useInsertText = (
  textareaRef: MaybeRefOrGetter<HTMLTextAreaElement | undefined>,
  target?: Ref<{ begin: number; end: number }>
) => {
  const insertText = (text: string) => {
    const textarea = toValue(textareaRef)

    if (!textarea) return

    if (target) {
      textarea.selectionStart = target.value.begin
      textarea.selectionEnd = target.value.end
    }

    // Windowsでの\r\nを含む文字列を貼り付けた後に
    // Ctrl+Zでアンドゥすると、キャレットの位置がずれるので
    // ずれないように\nに統一しておく
    const normalizedText = text.replaceAll('\r\n', '\n')
    insert(textarea, normalizedText)
  }

  return { insertText }
}

export default useInsertText
