import { computed, nextTick, Ref } from 'vue'

const getDefaultTarget = (textareaRef: Ref<HTMLTextAreaElement | undefined>) =>
  computed(() => ({
    begin: textareaRef.value?.selectionStart ?? 0,
    end: textareaRef.value?.selectionEnd ?? 0
  }))

const useInsertText = (
  textareaText: Ref<string>,
  textareaRef: Ref<HTMLTextAreaElement | undefined>,
  target: Ref<{ begin: number; end: number }> = getDefaultTarget(textareaRef)
) => {
  const insertText = async (text: string) => {
    if (!textareaRef.value) return

    const pre = textareaText.value.slice(0, target.value.begin)
    const suf = textareaText.value.slice(target.value.end)
    const selectionIndex = pre.length + text.length
    textareaText.value = `${pre}${text}${suf}`

    await nextTick()
    textareaRef.value.selectionStart = textareaRef.value.selectionEnd = selectionIndex
  }

  return { insertText }
}

export default useInsertText
