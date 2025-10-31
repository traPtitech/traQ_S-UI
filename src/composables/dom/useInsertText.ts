import { toValue, type MaybeRefOrGetter } from 'vue'

/**
 * これを利用したときはCtrl+Zなどがきく
 */
const useInsertText = (
  textareaRef: MaybeRefOrGetter<HTMLTextAreaElement | undefined>,
  targetRef?: MaybeRefOrGetter<{ begin: number; end: number }>
) => {
  const insertText = (text: string) => {
    const textarea = toValue(textareaRef)
    if (!textarea) return

    const target = toValue(targetRef)

    textarea.setRangeText(
      text,
      target?.begin ?? textarea.selectionStart,
      target?.end ?? textarea.selectionEnd,
      'end'
    )
  }

  return { insertText }
}

export default useInsertText
