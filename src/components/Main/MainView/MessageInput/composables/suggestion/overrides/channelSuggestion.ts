import { type MaybeRefOrGetter, computed, toValue } from 'vue'

import type { Candidate } from '/@/lib/suggestion/basic'

const CHANNEL_PATH_TRIMMING_REGEXP = /^#|\/$/

const channelSuggestionOverride = <
  Params extends {
    suggesterWidth: MaybeRefOrGetter<number>
    confirmedPart: MaybeRefOrGetter<string>
    suggestedCandidates: MaybeRefOrGetter<Candidate[]>
  }
>(
  input: Params
) => {
  const isChannelSuggestion = computed(() =>
    toValue(input.confirmedPart).startsWith('#')
  )

  const confirmedChannelPath = computed(() => {
    return toValue(input.confirmedPart)
      .replace(CHANNEL_PATH_TRIMMING_REGEXP, '')
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

  return {
    condition: isChannelSuggestion,
    overrides: {
      suggesterWidth: 360,
      suggestedCandidates
    }
  }
}

export default channelSuggestionOverride
