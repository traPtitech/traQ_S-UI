import { type MaybeRefOrGetter, computed, toValue } from 'vue'

import type { Candidate, Word, WordWithId } from '/@/lib/suggestion/basic'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStampRecommendations } from '/@/store/domain/stampRecommendations'

const stampSuggestionOverride = <
  Params extends {
    onSelect: (word: Word) => void
    confirmedPart: MaybeRefOrGetter<string>
    suggestedCandidates: MaybeRefOrGetter<Candidate[]>
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
    upsertLocalStampHistory(word.id, new Date())
    recordStampUsage(word.id)
    input.onSelect({ ...word, text: `${word.text}:` })
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
