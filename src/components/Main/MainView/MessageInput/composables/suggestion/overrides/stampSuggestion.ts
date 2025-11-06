import { type MaybeRefOrGetter, computed, toValue } from 'vue'

import { useStampHistory } from '/@/store/domain/stampHistory'

import type {
  Candidate,
  ConfirmedPart,
  WordOrConfirmedPart
} from '../useWordSuggester'
import type { WordWithId } from '../useWordSuggestionList'

const stampSuggestionOverride = <
  Params extends {
    onSelect: (word: WordOrConfirmedPart) => void
    confirmedPart: MaybeRefOrGetter<ConfirmedPart>
    suggestedCandidates: MaybeRefOrGetter<Candidate[]>
  }
>(
  input: Params
) => {
  const { upsertLocalStampHistory } = useStampHistory()

  const isStampSuggestion = computed(() =>
    toValue(input.confirmedPart).text.startsWith(':')
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
