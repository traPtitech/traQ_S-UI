import store from '/@/store'
import TrieTree from '/@/lib/basic/trieTree'
import { animeEffectSet, sizeEffectSet } from '/@/lib/markdown/effects'
import { ref, onBeforeUnmount, computed, Ref, readonly, watchEffect } from 'vue'
import { EntityEventMap, entityMitt } from '/@/store/entities/mitt'
import {
  getDeterminedCharacters,
  Target,
  getPrevCandidateIndex,
  getNextCandidateIndex
} from '/@/lib/suggestion'

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

type WordWithId = {
  type: 'user' | 'user-group' | 'stamp'
  text: string
  id: string
}
type WordWithoutId = {
  type: 'stamp-effect'
  text: string
}

export type Word = WordWithId | WordWithoutId

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

/**
 * @param minLength 補完が利用できるようになる最小の文字数
 */
const useWordSuggestionList = (
  target: Ref<Target>,
  currentInputWord: Ref<string>,
  minLength: number
) => {
  const tree = useCandidateTree()
  const candidates = computed(() =>
    target.value.word.length >= minLength
      ? tree.value.search(target.value.word.replace(/＠/g, '@'))
      : []
  )
  const confirmedPart = computed(() =>
    getDeterminedCharacters(candidates.value.map(obj => obj.text))
  )

  /**
   * nullのときは未選択
   * -1のときは確定部分が選択されている
   * 0～のときは候補が選択されている
   */
  const selectedIndex = ref<number | null>(null)
  watchEffect(() => {
    const i = candidates.value.findIndex(c => c.text === currentInputWord.value)
    // 候補に存在せず確定部とも一致していなかったら選択状態を解除
    if (i === -1 && confirmedPart.value !== currentInputWord.value) {
      selectedIndex.value = null
      return
    }

    selectedIndex.value = i
  })

  const getCandidateTextFromIndex = (i: number) => {
    if (i === -1) return confirmedPart.value
    return candidates.value[i]?.text ?? ''
  }
  const prevCandidateText = computed(() =>
    getCandidateTextFromIndex(
      getPrevCandidateIndex(candidates.value, selectedIndex.value)
    )
  )
  const nextCandidateText = computed(() =>
    getCandidateTextFromIndex(
      getNextCandidateIndex(candidates.value, selectedIndex.value)
    )
  )

  return {
    suggestedCandidates: candidates,
    confirmedPart,
    selectedCandidateIndex: readonly(selectedIndex),
    prevCandidateText,
    nextCandidateText
  }
}

export default useWordSuggestionList
