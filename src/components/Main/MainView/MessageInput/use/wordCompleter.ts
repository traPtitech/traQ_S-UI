import { nextTick, ComputedRef, WritableComputedRef, Ref } from 'vue'
import { Target } from './wordSuggester'

const getDeterminedCharacters = (candidates: string[]) => {
  const minLength = Math.min(...candidates.map(c => c.length))
  const determined: string[] = []
  for (let i = 0; i < minLength; i++) {
    determined[i] = [...candidates[0]][i]
    for (const candidate of candidates) {
      if (determined[i] !== [...candidate][i]) {
        return determined.slice(0, determined.length - 1).join('')
      }
    }
  }
  return determined.join('')
}

const useWordCompleter = (
  textareaRef: ComputedRef<HTMLTextAreaElement | undefined>,
  target: Ref<Target>,
  value: WritableComputedRef<string>,
  suggestedCandidates: Ref<string[]>,
  showSuggester: Ref<boolean>
) => {
  const commitCompletion = async (word: string) => {
    value.value =
      value.value.slice(0, target.value.begin) +
      word +
      value.value.slice(target.value.end)
    showSuggester.value = false
    await nextTick()
    textareaRef.value?.setSelectionRange(
      target.value.begin + word.length,
      target.value.begin + word.length
    )
  }
  const onKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Tab' && !e.isComposing) {
      e.preventDefault()
      if (!textareaRef.value) return
      if (suggestedCandidates.value.length === 0) {
        return
      }
      const determined = getDeterminedCharacters(suggestedCandidates.value)
      commitCompletion(determined)
    }
  }
  const onSelect = async (word: string) => {
    commitCompletion(word)
  }
  return { onKeyDown, onSelect }
}

export default useWordCompleter
