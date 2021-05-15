import { nextTick, Ref } from 'vue'

const useInsertText = (
  textareaText: Ref<string>,
  textareaRef: Ref<HTMLTextAreaElement | undefined>,
  target?: Ref<{ begin: number; end: number }>
) => {
  const insertText = async (text: string) => {
    if (!textareaRef.value) return

    const preIndex =
      target?.value.begin ?? textareaRef.value?.selectionStart ?? 0
    const sufIndex = target?.value.end ?? textareaRef.value?.selectionEnd ?? 0

    const pre = textareaText.value.slice(0, preIndex)
    const suf = textareaText.value.slice(sufIndex)
    const selectionIndex = pre.length + text.length
    textareaText.value = `${pre}${text}${suf}`

    await nextTick()
    textareaRef.value.selectionStart = textareaRef.value.selectionEnd =
      selectionIndex
  }

  return { insertText }
}

export default useInsertText
