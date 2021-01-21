import store from '@/store'
import createTree from '@/lib/trieTree'
import { animeEffectSet, sizeEffectSet } from '@traptitech/traq-markdown-it'
import { nextTick, ComputedRef, WritableComputedRef, ref } from 'vue'
import textFieldMirror from './textFieldMirror'

export const getCurrentWord = (elm: HTMLTextAreaElement, text: string) => {
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
  const position = ref({ top: 0, left: 0 })
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
    const target = getCurrentWord(textareaRef.value, value.value)
    if (target.divided || target.word.length < 3) {
      hideSuggester.value = true
      return
    }
    suggesteCandidates.value = tree.search(target.word.replaceAll('＠', '@'))
    if (suggesteCandidates.value.length === 0) {
      hideSuggester.value = true
      return
    }
    const { mirror, marker } = textFieldMirror(textareaRef.value, target.begin)
    position.value = { top: marker.offsetTop, left: marker.offsetLeft }
    hideSuggester.value = false
  }
  const onSelect = async (word: string) => {
    if (!textareaRef.value) return
    const target = getCurrentWord(textareaRef.value, value.value)
    value.value =
      value.value.slice(0, target.begin) +
      word +
      (target.end === value.value.length ? '' : value.value.slice(target.end))
    await nextTick()
    textareaRef.value.setSelectionRange(
      target.begin + word.length,
      target.begin + word.length
    )
  }
  const onBlur = async (e: MouseEvent) => {
    if (e.target !== e.currentTarget) {
      console.log(e.target)
      console.log(e.currentTarget)
      return
    }
    hideSuggester.value = true
  }
  return {
    onKeyUp,
    onSelect,
    onBlur,
    tree,
    hideSuggester,
    position,
    suggesteCandidates
  }
}

export default useWordSuggester
