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
  const isStampSuggestion = computed(() =>
    toValue(input.confirmedPart).startsWith(':')
  )
  const isChannelSuggestion = computed(() =>
    toValue(input.confirmedPart).startsWith('#')
  )

  const onSelect = (word: WordWithId) => {
    const textarea = toValue(input.textareaRef)
    const target = input.target
    if (!textarea) return
    let insertingText: string
    if (!textarea.value || target.value.begin === 0) {
      insertingText = word.text + ' '
    } else {
      const prevChar = textarea.value[target.value.begin - 1]
      if (prevChar === ' ' || prevChar === '\n') {
        insertingText = word.text + ' '
      } else {
        insertingText = ' ' + word.text + ' '
      }
    }

    input.onSelect({ ...word, text: insertingText })
  }

  return {
    condition: computed(
      () => isStampSuggestion.value || isChannelSuggestion.value
    ),
    overrides: {
      onSelect
    }
  }
}

export default insertSpaceOverride
