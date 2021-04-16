import store from '@/store'
import TrieTree from '@/lib/trieTree'
import { animeEffectSet, sizeEffectSet } from '@traptitech/traq-markdown-it'
import { ComputedRef, WritableComputedRef, ref, onBeforeUnmount } from 'vue'
import getCaretPosition from '@/lib/caretPosition'
import { EntityEventMap, entityMitt } from '@/store/entities/mitt'
import {
  getCurrentWord,
  getDeterminedCharacters,
  Target
} from '@/lib/suggestion'

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
  const isSuggesterShown = ref(false)
  const interactingWithList = ref(false)
  const position = ref({ top: 0, left: 0 })
  const target = ref<Target>({
    word: '',
    begin: 0,
    end: 0,
    divided: false
  })
  const suggestedCandidates = ref<Word[]>([])
  const selectedCandidateIndex = ref(-1)
  const confirmedPart = ref('')

  const tree = useCandidateTree()

  const hideSuggester = () => {
    isSuggesterShown.value = false
    suggestedCandidates.value = []
    selectedCandidateIndex.value = -1
    confirmedPart.value = ''
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (!isSuggesterShown.value) return
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (selectedCandidateIndex.value <= 0) {
        selectedCandidateIndex.value = suggestedCandidates.value.length
      }
      selectedCandidateIndex.value--
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (selectedCandidateIndex.value > suggestedCandidates.value.length - 2) {
        selectedCandidateIndex.value = -1
      }
      selectedCandidateIndex.value++
    }
  }
  const onKeyUp = async (e: KeyboardEvent) => {
    if (!textareaRef.value) return
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') return
    target.value = getCurrentWord(textareaRef.value, value.value)
    if (target.value.divided || target.value.word.length < 3) {
      hideSuggester()
      return
    }
    if (e.key === 'Tab') return
    suggestedCandidates.value = tree.value.search(
      target.value.word.replaceAll('＠', '@')
    )
    confirmedPart.value = getDeterminedCharacters(
      suggestedCandidates.value.map(obj => obj.text)
    )

    selectedCandidateIndex.value = -1
    if (suggestedCandidates.value.length === 0) {
      isSuggesterShown.value = false
      return
    }
    position.value = getCaretPosition(textareaRef.value, target.value.begin)
    isSuggesterShown.value = true
  }

  const beforeSelect = async () => {
    interactingWithList.value = true
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
    onBlur,
    hideSuggester,
    isSuggesterShown,
    position,
    target,
    suggestedCandidates,
    selectedCandidateIndex,
    confirmedPart
  }
}

export default useWordSuggester
