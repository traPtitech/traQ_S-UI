import { type MaybeRefOrGetter, computed, toValue } from 'vue'

import type { Candidate, ConfirmedPart } from '../useWordSuggester'

const CHANNEL_PATH_TRIMMING_REGEXP = /^#|\/$/

const channelSuggestionOverride = <
  Params extends {
    suggesterWidth: MaybeRefOrGetter<number>
    confirmedPart: MaybeRefOrGetter<ConfirmedPart>
    suggestedCandidates: MaybeRefOrGetter<Candidate[]>
  }
>(
  input: Params
) => {
  const isChannelSuggestion = computed(() =>
    toValue(input.confirmedPart).text.startsWith('#')
  )

  const confirmedChannelPath = computed(() => {
    return toValue(input.confirmedPart)
      .text.replace(CHANNEL_PATH_TRIMMING_REGEXP, '')
      .split('/')
  })

  const confirmedChannelPathString = computed(() =>
    confirmedChannelPath.value.slice(0, -1).join('/')
  )

  const confirmedChannelShortenedPathString = computed(() =>
    confirmedChannelPath.value
      .slice(0, -1)
      .map(part => part[0])
      .join('/')
  )

  const suggestedCandidates = computed(() => {
    const regExp = new RegExp(`#${confirmedChannelPathString.value}`, 'i')

    return toValue(input.suggestedCandidates).map(candidate => {
      const restPath = candidate.word.text.replace(regExp, '')

      return {
        ...candidate,
        display: `#${confirmedChannelShortenedPathString.value}${restPath}`
      }
    })
  })

  const confirmedPartDisplay = computed(() => {
    const confirmedPath = [
      confirmedChannelShortenedPathString.value,
      confirmedChannelPath.value.at(-1)
    ]
      .filter(Boolean)
      .join('/')

    return `#${confirmedPath}`
  })

  const confirmedPart = computed(() => ({
    ...toValue(input.confirmedPart),
    display: confirmedPartDisplay.value
  }))

  return {
    condition: isChannelSuggestion,
    overrides: {
      suggesterWidth: 360,
      confirmedPart,
      suggestedCandidates
    }
  }
}

export default channelSuggestionOverride
