import store from '@/store'
import TrieTree from '@/lib/trieTree'
import { animeEffectSet, sizeEffectSet } from '@traptitech/traq-markdown-it'
import {
  ComputedRef,
  WritableComputedRef,
  ref,
  onBeforeUnmount,
  computed,
  watch
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

const useWordSuggester = (
  textareaRef: ComputedRef<HTMLTextAreaElement | undefined>,
  value: WritableComputedRef<string>
) => {
  const tree = useCandidateTree()

  const position = ref({ top: 0, left: 0 })
  watch(value, () => {
    if (!textareaRef.value) return
    position.value = getCaretPosition(textareaRef.value, target.value.begin)
  })

  const isSuggesterShown = ref(false)
  const interactingWithList = ref(false)
  const target = ref<Target>({
    word: '',
    begin: 0,
    end: 0,
    divided: false
  })
  const suggestedCandidates = computed(() =>
    tree.value.search(target.value.word.replaceAll('＠', '@'))
  )
  const selectedCandidateIndex = ref(-1)
  const confirmedPart = computed(() =>
    getDeterminedCharacters(suggestedCandidates.value.map(obj => obj.text))
  )

  const hideSuggester = () => {
    isSuggesterShown.value = false
    selectedCandidateIndex.value = -1
  }

  const { insertText } = useInsertText(value, textareaRef, target)

  const insertTextAndMoveTarget = (text: string) => {
    insertText(text)
    target.value.end = target.value.begin + text.length
  }

  const selectPrev = () => {
    if (selectedCandidateIndex.value <= 0) {
      selectedCandidateIndex.value = suggestedCandidates.value.length
    }
    selectedCandidateIndex.value--
  }
  const selectNext = () => {
    if (selectedCandidateIndex.value > suggestedCandidates.value.length - 2) {
      selectedCandidateIndex.value = -1
    }
    selectedCandidateIndex.value++
  }
  const updateTarget = () => {
    if (!textareaRef.value) return
    target.value = getCurrentWord(textareaRef.value, value.value)
    if (target.value.divided || target.value.word.length < 3) {
      hideSuggester()
      return
    }

    selectedCandidateIndex.value = -1
    if (suggestedCandidates.value.length === 0) {
      isSuggesterShown.value = false
      return
    }
    isSuggesterShown.value = true
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab' && !e.isComposing) {
      if (!textareaRef.value) return
      if (suggestedCandidates.value.length === 0) return
      e.preventDefault()
      if (suggestedCandidates.value.length === 1) {
        insertTextAndMoveTarget(suggestedCandidates.value[0].text)
        hideSuggester()
        return
      }
      if (selectedCandidateIndex.value === -1) {
        insertTextAndMoveTarget(confirmedPart.value)
        if (confirmedPart.value === suggestedCandidates.value[0].text) {
          selectedCandidateIndex.value++
        }
      } else {
        insertTextAndMoveTarget(
          suggestedCandidates.value[selectedCandidateIndex.value].text
        )
      }
      if (
        selectedCandidateIndex.value ===
        suggestedCandidates.value.length - 1
      ) {
        selectedCandidateIndex.value = 0
        return
      }
      selectedCandidateIndex.value++
    }

    if (!isSuggesterShown.value) return
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectPrev()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectNext()
    }
  }
  const onKeyUp = async (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') return
    updateTarget()
  }

  const beforeSelect = async () => {
    interactingWithList.value = true
  }
  const onSelect = async (word: WordOrConfirmedPart) => {
    insertText(word.text)
    hideSuggester()
    textareaRef.value?.focus()
  }
  const onBlur = async () => {
    if (interactingWithList.value) {
      interactingWithList.value = false
      return
    }
    hideSuggester()
  }

  return {
    onKeyDown,
    onKeyUp,
    beforeSelect,
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
