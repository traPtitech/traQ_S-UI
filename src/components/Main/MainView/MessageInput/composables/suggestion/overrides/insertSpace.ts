import { type MaybeRefOrGetter, type Ref, computed, toValue } from 'vue'

import type { Target, Word, WordWithId } from '/@/lib/suggestion/basic'

const insertSpaces = (
  textInTextarea: string,
  word: string,
  beginIndex: number
) => {
  if (!textInTextarea || beginIndex === 0) {
    return word + ' '
  } else {
    const prevChar = textInTextarea[beginIndex - 1]
    if (prevChar === ' ' || prevChar === '\n') {
      return word + ' '
    }
    //アイコンを打とうとしているときにはスペースを入れない
    else if (prevChar === ':' && word[0] === '@') {
      return word
    } else {
      return ' ' + word + ' '
    }
  }
}

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
  const shouldInsertSpaces = computed(() => {
    const confirmed = toValue(input.confirmedPart)
    return (
      confirmed.startsWith(':') ||
      confirmed.startsWith('#') ||
      confirmed.startsWith('@')
    )
  })

  const onSelect = (word: WordWithId) => {
    const textarea = toValue(input.textareaRef)
    const target = input.target
    if (!textarea) return

    const insertingText = insertSpaces(
      textarea.value,
      word.text,
      target.value.begin
    )
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
