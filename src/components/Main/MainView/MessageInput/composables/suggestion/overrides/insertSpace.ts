import { type MaybeRefOrGetter, type Ref, computed, toValue } from 'vue'

import type { Target, Word, WordWithId } from '/@/lib/suggestion/basic'

const insertSpaceOverride = <
  Params extends {
    onSelect: (word: Word) => void
    confirmedPart: MaybeRefOrGetter<string>
    textareaRef: MaybeRefOrGetter<HTMLTextAreaElement | undefined>
    target: Ref<Target>
  }
>(
  input: Params
) => {
  const confirmed = toValue(input.confirmedPart) 
  const shouldInsertSpaces = computed(
    () =>
      confirmed.startsWith(':') ||
      confirmed.startsWith('#') ||
      confirmed.startsWith('@')
  )

  const onSelect = (word: WordWithId) => {
    const textarea = toValue(input.textareaRef)
    const target = input.target
    if (!textarea) return

    const insertSpaces = () => {
      if (!textarea.value || target.value.begin === 0) {
        return word.text + ' '
      } else {
        const prevChar = textarea.value[target.value.begin - 1]
        if (prevChar === ' ' || prevChar === '\n') {
          return word.text + ' '
        }
        //アイコンを打とうとしているときにはスペースを入れない
        else if (prevChar === ':' && word.text[0] === '@') {
          return word.text
        } else {
          return ' ' + word.text + ' '
        }
      }
    }

    const insertingText = insertSpaces()
    input.onSelect({ ...word, text: insertingText })
  }

  return {
    condition: shouldInsertSpaces,
    overrides: {
      onSelect
    }
  }
}

export default insertSpaceOverride
