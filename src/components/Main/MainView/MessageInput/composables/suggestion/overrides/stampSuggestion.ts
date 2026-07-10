import { type MaybeRefOrGetter, type Ref, computed, toValue } from 'vue'

import type {
  Candidate,
  Target,
  Word,
  WordWithId
} from '/@/lib/suggestion/basic'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStampRecommendations } from '/@/store/domain/stampRecommendations'

const stampSuggestionOverride = <
  Params extends {
    onSelect: (word: Word) => void
    confirmedPart: MaybeRefOrGetter<string>
    suggestedCandidates: MaybeRefOrGetter<Candidate[]>
    textareaRef: MaybeRefOrGetter<HTMLTextAreaElement | undefined>
    target: Ref<Target>
  }
>(
  input: Params
) => {
  const { upsertLocalStampHistory } = useStampHistory()
  const { recordStampUsage } = useStampRecommendations()

  const isStampSuggestion = computed(() =>
    toValue(input.confirmedPart).startsWith(':')
  )

  const suggestedCandidates = computed(() => {
    return toValue(input.suggestedCandidates).map(candidate => {
      return {
        ...candidate,
        display: `${candidate.word.text}:`
      }
    })
  })

  const onSelect = (word: WordWithId) => {
    const textarea = toValue(input.textareaRef)
    const target = input.target
    if (!textarea) return
    let insertingText: string
    if (!textarea.value || target.value.begin === 0) {
      insertingText = `${word.text}: `
    } else {
      const prevChar = textarea.value[target.value.begin - 1]
      if (prevChar === ' ' || prevChar === '\n') {
        insertingText = `${word.text}: `
      } else {
        insertingText = ` ${word.text}: `
      }
    }
    
    upsertLocalStampHistory(word.id, new Date())
    recordStampUsage(word.id)

    input.onSelect({ ...word, text: insertingText })
  }

  return {
    condition: isStampSuggestion,
    overrides: {
      onSelect,
      suggestedCandidates
    }
  }
}

export default stampSuggestionOverride
