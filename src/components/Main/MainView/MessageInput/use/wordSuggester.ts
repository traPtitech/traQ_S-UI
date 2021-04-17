import { ComputedRef, WritableComputedRef, ref, computed } from 'vue'
import getCaretPosition from '@/lib/caretPosition'
import { getCurrentWord, Target } from '@/lib/suggestion'
import useWordSuggesterList, { Word } from './wordSuggestionList'
import useInsertText from '@/use/insertText'

export type WordOrConfirmedPart =
  | Word
  | {
      type: 'confirmed-part'
      text: string
    }

const useWordSuggester = (
  textareaRef: ComputedRef<HTMLTextAreaElement | undefined>,
  value: WritableComputedRef<string>
) => {
  const isSuggesterShown = ref(false)
  const target = ref<Target>({
    word: '',
    begin: 0,
    end: 0,
    divided: false
  })
  /**
   * targetは補完をしたときに更新されないがこれは更新される
   * これはtargetを更新すると候補リストが変わってしまうため
   * (補完をしたときは候補リストを変化させたくない)
   */
  const currentInputWord = ref('')

  const position = computed(() => {
    if (!textareaRef.value) return { top: 0, left: 0 }
    return getCaretPosition(textareaRef.value, target.value.begin)
  })

  const {
    suggestedCandidates,
    confirmedPart,
    selectedCandidateIndex,
    prevCandidateText,
    nextCandidateText
  } = useWordSuggesterList(target, currentInputWord)

  const { insertText } = useInsertText(value, textareaRef, target)
  const insertTextAndMoveTarget = (text: string) => {
    insertText(text)
    target.value.end = target.value.begin + text.length
  }

  const updateTarget = () => {
    if (!textareaRef.value) return
    target.value = getCurrentWord(textareaRef.value, value.value)
    if (target.value.divided || target.value.word.length < 3) {
      isSuggesterShown.value = false
      return
    }

    if (suggestedCandidates.value.length === 0) {
      isSuggesterShown.value = false
      return
    }
    isSuggesterShown.value = true
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.isComposing) return

    // Tabによるフォーカスの移動を防止するためにkeyDownで行う必要がある
    if (e.key === 'Tab') {
      e.preventDefault()
      if (suggestedCandidates.value.length === 0) return
      if (suggestedCandidates.value.length === 1) {
        isSuggesterShown.value = false
      }
      // 未選択状態では確定部分が補完される
      insertTextAndMoveTarget(nextCandidateText.value)
      return
    }

    if (!isSuggesterShown.value) return
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      insertTextAndMoveTarget(prevCandidateText.value)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      insertTextAndMoveTarget(nextCandidateText.value)
      return
    }
  }
  const onKeyUp = async (e: KeyboardEvent) => {
    if (!textareaRef.value) return

    // 文字入力後の状態をとるためkeyUpで行う必要がある
    currentInputWord.value = getCurrentWord(textareaRef.value, value.value).word

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') return
    // 文字入力後の状態をとるためkeyUpで行う必要がある
    updateTarget()
  }

  const onSelect = async (word: WordOrConfirmedPart) => {
    insertText(word.text)
    isSuggesterShown.value = false
  }
  const onBlur = async () => {
    isSuggesterShown.value = false
  }

  return {
    onKeyDown,
    onKeyUp,
    onSelect,
    onBlur,
    isSuggesterShown,
    position,
    suggestedCandidates,
    selectedCandidateIndex,
    confirmedPart
  }
}

export default useWordSuggester
