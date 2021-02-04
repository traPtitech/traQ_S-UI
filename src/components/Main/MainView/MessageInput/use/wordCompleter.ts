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
  selectedCandidateIndex: Ref<number>,
  showSuggester: Ref<boolean>
) => {
  const commitCompletion = async (word: string) => {
    value.value =
      value.value.slice(0, target.value.begin) +
      word +
      value.value.slice(target.value.end)
    await nextTick()
    textareaRef.value?.setSelectionRange(
      target.value.begin + word.length,
      target.value.begin + word.length
    )
  }
  const onKeyDown = async (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || e.isComposing) return
    if (!textareaRef.value) return
    if (suggestedCandidates.value.length === 0) return
    e.preventDefault()
    if (suggestedCandidates.value.length === 1) {
      commitCompletion(suggestedCandidates.value[0])
      showSuggester.value = false
      suggestedCandidates.value = []
      selectedCandidateIndex.value = -1
      return
    }
    if (selectedCandidateIndex.value === -1) {
      const determined = getDeterminedCharacters(suggestedCandidates.value)
      commitCompletion(determined)
      if (determined === suggestedCandidates.value[0]) {
        selectedCandidateIndex.value++
      }
    } else {
      commitCompletion(suggestedCandidates.value[selectedCandidateIndex.value])
    }
    if (selectedCandidateIndex.value === suggestedCandidates.value.length - 1) {
      return
    }
    selectedCandidateIndex.value++
  }
  const onSelect = async (index: number) => {
    commitCompletion(suggestedCandidates.value[index])
    showSuggester.value = false
    suggestedCandidates.value = []
    selectedCandidateIndex.value = -1
  }
  return { onKeyDown, onSelect }
}

export default useWordCompleter
