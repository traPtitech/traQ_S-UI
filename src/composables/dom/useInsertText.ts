import { toValue, type MaybeRefOrGetter, type Ref } from 'vue'

/**
 * これを利用したときはCtrl+Zなどがきく
 */
const useInsertText = (
  textareaRef: MaybeRefOrGetter<HTMLTextAreaElement | undefined>,
  target?: Ref<{ begin: number; end: number }>
) => {
  const insertText = (text: string) => {
    const textarea = toValue(textareaRef)
    if (!textarea) return

    // Windowsでの\r\nを含む文字列を貼り付けた後に
    // Ctrl+Zでアンドゥすると、キャレットの位置がずれるので
    // ずれないように\nに統一しておく
    const normalizedText = text.replaceAll('\r\n', '\n')
    textarea.setRangeText(
      normalizedText,
      target?.value.begin ?? textarea.selectionStart,
      target?.value.end ?? textarea.selectionEnd,
      'end'
    )
  }

  return { insertText }
}

export default useInsertText
