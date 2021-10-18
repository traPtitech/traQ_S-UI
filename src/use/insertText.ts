import { nextTick, Ref } from 'vue'

const useInsertText = (
  textareaText: Ref<string>,
  textareaRef: Ref<HTMLTextAreaElement | undefined>,
  target?: Ref<{ begin: number; end: number }>
) => {
  const insertText = async (text: string) => {
    if (!textareaRef.value) return

    // Windowsでの\r\nを含む文字列を貼り付けると\nとして貼り付けられるため
    // ずれないように\nに統一しておく
    const normalizedText = text.replace(/\r\n/g, '\n')

    const preIndex =
      target?.value.begin ?? textareaRef.value?.selectionStart ?? 0
    const sufIndex = target?.value.end ?? textareaRef.value?.selectionEnd ?? 0

    const pre = textareaText.value.slice(0, preIndex)
    const suf = textareaText.value.slice(sufIndex)
    const selectionIndex = pre.length + normalizedText.length
    textareaText.value = `${pre}${normalizedText}${suf}`

    await nextTick()
    textareaRef.value.selectionStart = textareaRef.value.selectionEnd =
      selectionIndex
  }

  return { insertText }
}

export default useInsertText
