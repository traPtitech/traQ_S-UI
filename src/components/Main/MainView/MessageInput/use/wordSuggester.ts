import store from '@/store'
import TrieTree from '@/lib/trieTree'
import { animeEffectSet, sizeEffectSet } from '@traptitech/traq-markdown-it'
import {
  ComputedRef,
  WritableComputedRef,
  ref,
  onBeforeUnmount,
  computed,
  Ref,
  readonly,
  watchEffect
} from 'vue'
import getCaretPosition from '@/lib/caretPosition'
import { EntityEventMap, entityMitt } from '@/store/entities/mitt'
import {
  getCurrentWord,
  getDeterminedCharacters,
  Target
} from '@/lib/suggestion'
import useInsertText from '@/use/insertText'

const events: Array<keyof EntityEventMap> = [
  'setUser',
  'setUsers',
  'deleteUser',
  'setUserGroup',
  'setUserGroups',
  'deleteUserGroup',
  'setStamp',
  'setStamps',
  'deleteStamp'
]

type WordType = 'user' | 'user-group' | 'stamp' | 'stamp-effect'
export type Word = {
  type: WordType
  text: string
  id?: string
}
export type WordOrConfirmedPart = {
  type: WordType | 'confirmed-part'
  text: string
  id?: string
}

const useCandidateTree = () => {
  const constructTree = () =>
    new TrieTree<Word>(
      // ユーザー名とグループ名に重複あり
      // メンションはcase insensitiveでユーザー名を優先
      // 重複を許す場合、優先するものから入れる
      store.getters.entities.allUsers.map(user => ({
        type: 'user',
        text: '@' + user.name,
        id: user.id
      })),
      store.getters.entities.allUserGroups.map(userGroup => ({
        type: 'user-group',
        text: '@' + userGroup.name,
        id: userGroup.id
      })),
      store.getters.entities.allStamps.map(stamp => ({
        type: 'stamp',
        text: ':' + stamp.name,
        id: stamp.id
      })),
      [...animeEffectSet, ...sizeEffectSet].map(effectName => ({
        type: 'stamp-effect',
        text: '.' + effectName
      }))
    )

  const tree = ref<TrieTree<Word>>(constructTree())
  const updateTree = () => {
    tree.value = constructTree()
  }

  events.forEach(event => {
    entityMitt.on(event, updateTree)
  })
  onBeforeUnmount(() => {
    events.forEach(event => {
      entityMitt.off(event, updateTree)
    })
  })

  return tree
}

const useSuggestionList = (
  target: Ref<Target>,
  currentInputWord: Ref<string>
) => {
  const tree = useCandidateTree()
  const suggestedCandidates = computed(() =>
    tree.value.search(target.value.word.replaceAll('＠', '@'))
  )
  const confirmedPart = computed(() =>
    getDeterminedCharacters(suggestedCandidates.value.map(obj => obj.text))
  )

  /**
   * nullのときは未選択
   * -1のときは確定部分が選択されている
   * 0～のときは候補が選択されている
   */
  const selectedCandidateIndex = ref<number | null>(null)
  watchEffect(() => {
    const i = suggestedCandidates.value.findIndex(
      c => c.text === currentInputWord.value
    )
    // 候補に存在せず確定部とも一致していなかったら選択状態を解除
    if (i === -1 && confirmedPart.value !== currentInputWord.value) {
      selectedCandidateIndex.value = null
      return
    }

    selectedCandidateIndex.value = i
  })

  const prevCandidateIndex = computed(() => {
    if (selectedCandidateIndex.value === null) {
      return -1
    }
    if (selectedCandidateIndex.value <= 0) {
      return suggestedCandidates.value.length - 1
    }
    return selectedCandidateIndex.value - 1
  })
  const nextCandidateIndex = computed(() => {
    if (selectedCandidateIndex.value === null) {
      return -1
    }
    if (selectedCandidateIndex.value >= suggestedCandidates.value.length - 1) {
      return -1
    }
    return selectedCandidateIndex.value + 1
  })

  const getCandidateTextFromIndex = (i: number) => {
    if (i === -1) return confirmedPart.value
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return suggestedCandidates.value[i]!.text
  }
  const prevCandidateText = computed(() =>
    getCandidateTextFromIndex(prevCandidateIndex.value)
  )
  const nextCandidateText = computed(() =>
    getCandidateTextFromIndex(nextCandidateIndex.value)
  )

  return {
    suggestedCandidates,
    confirmedPart,
    selectedCandidateIndex: readonly(selectedCandidateIndex),
    prevCandidateText,
    nextCandidateText
  }
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
  } = useSuggestionList(target, currentInputWord)

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
