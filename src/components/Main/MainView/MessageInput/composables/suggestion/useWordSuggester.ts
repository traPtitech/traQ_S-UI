import type { MaybeRefOrGetter } from 'vue'
import { computed, ref, toValue, watch } from 'vue'

import useInsertText from '/@/composables/dom/useInsertText'
import getCaretPosition from '/@/lib/dom/caretPosition'
import type { Target, Word } from '/@/lib/suggestion/basic'
import {
  getCurrentWord,
  getNextCandidateIndex,
  getPrevCandidateIndex,
  getSelectedCandidateIndex
} from '/@/lib/suggestion/basic'

import useWordSuggestionList from './useWordSuggestionList'

export interface Candidate {
  word: Word
  display?: string
}

/**
 * 補完を表示する最小の文字数
 * 3なら`@ab`のときは表示されて`@a`では表示されない
 */
const MIN_LENGTH = 3

const useWordSuggester = (
  textareaRef: MaybeRefOrGetter<HTMLTextAreaElement | undefined>
) => {
  const isSuggesterShown = ref(false)

  const target = ref<Target>({
    word: '',
    begin: 0,
    end: 0
  })

  /**
   * nullのときは未選択
   * -1のときは確定部分が選択されている
   * 0～のときは候補が選択されている
   */
  const selectedIndex = ref<number | null>(null)

  /**
   * targetは補完をしたときに更新されないがこれは更新する
   * これはtargetを更新すると候補リストが変わってしまうため
   * (補完をしたときは候補リストを変化させたくない)
   */
  const currentInputWord = ref('')

  const { suggestedCandidateWords, confirmedText } = useWordSuggestionList(
    () => target.value.word,
    MIN_LENGTH
  )

  watch(
    () => target.value.word,
    word => {
      currentInputWord.value = word

      selectedIndex.value = getSelectedCandidateIndex(
        suggestedCandidateWords.value,
        confirmedText.value,
        word
      )
    },
    {
      immediate: true
    }
  )

  const { insertText } = useInsertText(textareaRef, target)

  const position = computed(() => {
    const textarea = toValue(textareaRef)
    if (!textarea) return { top: 0, left: 0 }
    return getCaretPosition(textarea, target.value.begin)
  })

  const getCandidateTextFromIndex = (i: number) => {
    if (i === -1) return confirmedText.value
    return suggestedCandidateWords.value[i]?.text ?? ''
  }

  const insertTextAndMoveTarget = (index: number) => {
    selectedIndex.value = index
    const text = getCandidateTextFromIndex(index)

    insertText(text)
    target.value.end = target.value.begin + text.length
    currentInputWord.value = text
  }

  const updateTarget = () => {
    const textarea = toValue(textareaRef)
    if (!textarea) return

    target.value = getCurrentWord(textarea)

    if (target.value.word.length < MIN_LENGTH) {
      isSuggesterShown.value = false
      return
    }

    isSuggesterShown.value = suggestedCandidateWords.value.length > 0
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.isComposing) return
    if (!isSuggesterShown.value) return

    const prevIndex = getPrevCandidateIndex(
      suggestedCandidateWords.value.length,
      selectedIndex.value
    )

    const nextIndex = getNextCandidateIndex(
      suggestedCandidateWords.value.length,
      selectedIndex.value
    )

    // Tabによるフォーカスの移動を防止するため、長押しで連続移動できるようにするためにkeyDownで行う必要がある
    if (e.key === 'Tab') {
      e.preventDefault()
      if (suggestedCandidateWords.value.length === 0) return
      if (suggestedCandidateWords.value.length === 1) {
        isSuggesterShown.value = false
      }

      // 未選択状態では確定部分が補完される
      if (e.shiftKey) {
        insertTextAndMoveTarget(prevIndex)
      } else {
        insertTextAndMoveTarget(nextIndex)
      }
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      insertTextAndMoveTarget(prevIndex)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      insertTextAndMoveTarget(nextIndex)
      return
    }
  }

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown') return
    // 文字入力後の状態をとるためkeyUpで行う必要がある
    updateTarget()

    // updateTarget内でisSuggesterShown.value = trueが実行されうるためここで行う
    if (e.key === 'Escape') {
      isSuggesterShown.value = false
    }
  }

  const onSelect = (word: Word) => {
    insertText(word.text)
    isSuggesterShown.value = false
  }

  const onBlur = () => {
    isSuggesterShown.value = false
  }

  const suggestedCandidates = computed(() => {
    return suggestedCandidateWords.value.map(word => ({ word }))
  })

  const confirmedPart = confirmedText

  return {
    onKeyDown,
    onKeyUp,
    onSelect,
    onBlur,
    isSuggesterShown,
    suggesterWidth: 240,
    position,
    suggestedCandidates,
    selectedIndex,
    confirmedPart
  }
}

export default useWordSuggester
