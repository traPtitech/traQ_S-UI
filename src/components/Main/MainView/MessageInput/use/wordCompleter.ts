import store from '@/store'
import createTree from '@/lib/trieTree'
import { nextTick, ComputedRef, WritableComputedRef } from 'vue'

const getCurrentWord = (elm: HTMLTextAreaElement, text: string) => {
  text = text.replaceAll('　', ' ')
  const startIndex = elm.selectionStart
  const endIndex = elm.selectionEnd
  const prevSpaceIndex = text.lastIndexOf(' ', startIndex - 1)
  const nextSpaceIndex = text.indexOf(' ', endIndex)
  const begin = prevSpaceIndex < 0 ? 0 : prevSpaceIndex + 1
  const end = nextSpaceIndex < 0 ? text.length : nextSpaceIndex
  const word = text.substring(begin, end)
  return { word, begin, end }
}

const getDeterminedCharacters = (candidates: string[]) => {
  const minLength = Math.min(...candidates.map(c => c.length))
  const determined: string[] = []
  for (let i = 0; i < minLength; i++) {
    determined[i] = candidates[0][i]
    for (const candidate of candidates) {
      if (determined[i] !== candidate[i]) {
        return determined.slice(0, determined.length - 1).join('')
      }
    }
  }
  return determined.join('')
}

const useWordCompleter = (
  textareaRef: ComputedRef<HTMLTextAreaElement | undefined>,
  value: WritableComputedRef<string>
) => {
  const tree = createTree(
    store.getters.entities.allUserNames.map(userName => '@' + userName),
    store.getters.entities.allUserGroupNames.map(
      userGroupName => '@' + userGroupName
    ),
    store.getters.entities.allStampNames.map(stampName => ':' + stampName + ':')
  )
  const onKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Tab' && !e.isComposing) {
      e.preventDefault()
      if (!textareaRef.value) return
      const target = getCurrentWord(textareaRef.value, value.value)
      const determined = getDeterminedCharacters(tree.search(target.word))
      value.value =
        value.value.slice(0, target.begin) +
        (tree.search(target.word).length === 0 ? target.word : determined) +
        (target.end === value.value.length ? '' : value.value.slice(target.end))
      await nextTick()
      textareaRef.value.setSelectionRange(
        target.begin + determined.length,
        target.begin + determined.length
      )
    }
  }
  return { onKeyDown }
}

export default useWordCompleter
