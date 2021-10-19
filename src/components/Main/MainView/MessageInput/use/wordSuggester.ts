import { ComputedRef, WritableComputedRef, ref, computed, watch } from 'vue'
import getCaretPosition from '/@/lib/dom/caretPosition'
import { getCurrentWord, Target } from '/@/lib/suggestion'
import useWordSuggesterList, { Word } from './wordSuggestionList'
import useInsertText from '/@/use/insertText'
import store from '/@/store'

export type WordOrConfirmedPart =
  | Word
  | {
      type: 'confirmed-part'
      text: string
    }

/**
 * 補完を表示する最小の文字数
 * 3なら`@ab`のときは表示されて`@a`では表示されない
 */
const MIN_LENGTH = 3

const useWordSuggester = (
  textareaRef: ComputedRef<HTMLTextAreaElement | undefined>,
  value: WritableComputedRef<string>
) => {
  const isSuggesterShown = ref(false)
  const target = ref<Target>({
    word: '',
    begin: 0,
    end: 0
  })
  /**
   * targetは補完をしたときに更新されないがこれは更新する
   * これはtargetを更新すると候補リストが変わってしまうため
   * (補完をしたときは候補リストを変化させたくない)
   */
  const currentInputWord = ref('')
  watch(
    () => target.value.word,
    word => {
      currentInputWord.value = word
    }
  )

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
  } = useWordSuggesterList(target, currentInputWord, MIN_LENGTH)

  const { insertText } = useInsertText(textareaRef, target)
  const insertTextAndMoveTarget = (text: string) => {
    insertText(text)
    target.value.end = target.value.begin + text.length
    currentInputWord.value = text
  }

  const updateTarget = () => {
    if (!textareaRef.value) return
    target.value = getCurrentWord(textareaRef.value, value.value)
    if (target.value.word.length < MIN_LENGTH) {
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
    if (!isSuggesterShown.value) return

    // Tabによるフォーカスの移動を防止するため、長押しで連続移動できるようにするためにkeyDownで行う必要がある
    if (e.key === 'Tab') {
      e.preventDefault()
      if (suggestedCandidates.value.length === 0) return
      if (suggestedCandidates.value.length === 1) {
        isSuggesterShown.value = false
      }

      // 未選択状態では確定部分が補完される
      if (e.shiftKey) {
        insertTextAndMoveTarget(prevCandidateText.value)
      } else {
        insertTextAndMoveTarget(nextCandidateText.value)
      }
      return
    }

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
    if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown') return
    // 文字入力後の状態をとるためkeyUpで行う必要がある
    updateTarget()

    // updateTarget内でisSuggesterShown.value = trueが実行されうるためここで行う
    if (e.key === 'Escape') {
      isSuggesterShown.value = false
    }
  }

  const onSelect = async (word: WordOrConfirmedPart) => {
    if (word.type === 'stamp') {
      insertText(`${word.text}:`)
      store.commit.domain.me.upsertLocalStampHistory({
        stampId: word.id,
        datetime: new Date()
      })
    } else {
      insertText(word.text)
    }
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
