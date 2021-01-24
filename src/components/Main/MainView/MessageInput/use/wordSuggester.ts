import store from '@/store'
import createTree from '@/lib/trieTree'
import { animeEffectSet, sizeEffectSet } from '@traptitech/traq-markdown-it'
import { ComputedRef, WritableComputedRef, ref } from 'vue'
import getCaretPosition from '@/lib/caretPosition'

export type Target = {
  word: string
  begin: number
  end: number
  divided: boolean
}

const getCurrentWord = (elm: HTMLTextAreaElement, text: string): Target => {
  text = text.replaceAll('　', ' ')
  const startIndex = elm.selectionStart
  const prevAtMarkIndex = text.lastIndexOf('@', startIndex - 1)
  const prevColonIndex = text.lastIndexOf(':', startIndex - 1)
  const prevPeriodIndex = text.lastIndexOf('.', startIndex - 1)
  const nearest = Math.max(prevAtMarkIndex, prevColonIndex, prevPeriodIndex)
  const begin = nearest < 0 ? 0 : nearest
  const end = elm.selectionEnd
  const word = text.substring(begin, end)
  const prevSpaceIndex = text.lastIndexOf(' ', startIndex - 1)
  const divided = prevSpaceIndex > nearest
  return { word, begin, end, divided }
}

const useWordSuggester = (
  textareaRef: ComputedRef<HTMLTextAreaElement | undefined>,
  value: WritableComputedRef<string>
) => {
  const hideSuggester = ref(true)
  const interactingWithList = ref(false)
  const position = ref({ top: 0, left: 0 })
  const target = ref({
    word: '',
    begin: 0,
    end: 0,
    divided: false
  }) as Ref<Target>
  const suggesteCandidates = ref([] as string[])

  const tree = createTree(
    // ユーザー名とグループ名に重複あり
    // メンションはcase insensitiveでユーザー名を優先
    // 重複を許す場合、優先するものから入れる
    store.getters.entities.allUserNames.map(userName => '@' + userName),
    store.getters.entities.allUserGroupNames.map(
      userGroupName => '@' + userGroupName
    ),
    store.getters.entities.allStampNames.map(
      stampName => ':' + stampName + ':'
    ),
    [...animeEffectSet].map(effectName => '.' + effectName),
    [...sizeEffectSet].map(effectName => '.' + effectName)
  )

  const onKeyUp = async (e: KeyboardEvent) => {
    if (!textareaRef.value) return
    target.value = getCurrentWord(textareaRef.value, value.value)
    if (target.value.divided || target.value.word.length < 3) {
      hideSuggester.value = true
      return
    }
    suggesteCandidates.value = tree.search(
      target.value.word.replaceAll('＠', '@')
    )
    if (suggesteCandidates.value.length === 0) {
      hideSuggester.value = true
      return
    }
    position.value = getCaretPosition(textareaRef.value, target.value.begin)
    hideSuggester.value = false
  }
  const onBlur = async () => {
    if (interactingWithList.value) {
      interactingWithList.value = false
      return
    }
    hideSuggester.value = true
  }
  const onMousedown = async () => {
    interactingWithList.value = true
  }
  return {
    onKeyUp,
    onBlur,
    onMousedown,
    hideSuggester,
    position,
    target,
    suggesteCandidates
  }
}

export default useWordSuggester
