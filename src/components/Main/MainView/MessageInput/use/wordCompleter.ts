import { ComputedRef, WritableComputedRef, Ref } from 'vue'
import { Target } from '@/lib/suggestion'
import { Word, WordOrConfirmedPart } from './wordSuggester'
import useInsertText from '@/use/insertText'

const useWordCompleter = (
  textareaRef: ComputedRef<HTMLTextAreaElement | undefined>,
  target: Ref<Target>,
  value: WritableComputedRef<string>,
  suggestedCandidates: Ref<Word[]>,
  selectedCandidateIndex: Ref<number>,
  confirmedPart: Ref<string>,
  /**
   * 補完候補を確定させたとき
   * 例えば、クリックしたのでこれ以上補完候補を表示しないようにするときなどに利用
   */
  onCompleteDetermined: () => void
) => {
  const { insertText } = useInsertText(value, textareaRef, target)

  const onKeyDown = async (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || e.isComposing) return
    if (!textareaRef.value) return
    if (suggestedCandidates.value.length === 0) return
    e.preventDefault()
    if (suggestedCandidates.value.length === 1) {
      insertText(suggestedCandidates.value[0].text)
      target.value.end = target.value.begin + suggestedCandidates.value.length
      onCompleteDetermined()
      return
    }
    if (selectedCandidateIndex.value === -1) {
      insertText(confirmedPart.value)
      target.value.end = target.value.begin + confirmedPart.value.length
      if (confirmedPart.value === suggestedCandidates.value[0].text) {
        selectedCandidateIndex.value++
      }
    } else {
      insertText(suggestedCandidates.value[selectedCandidateIndex.value].text)
      target.value.end =
        target.value.begin +
        suggestedCandidates.value[selectedCandidateIndex.value].text.length
    }
    if (selectedCandidateIndex.value === suggestedCandidates.value.length - 1) {
      selectedCandidateIndex.value = 0
      return
    }
    selectedCandidateIndex.value++
  }
  const onSelect = async (word: WordOrConfirmedPart) => {
    insertText(word.text)
    onCompleteDetermined()
  }
  return { onKeyDown, onSelect }
}

export default useWordCompleter
