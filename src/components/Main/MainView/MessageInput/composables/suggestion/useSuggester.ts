import { toOverridable } from '/@/lib/suggestion/applier'
import useWordSuggester from './useWordSuggester'
import channelSuggestionOverride from './overrides/channelSuggestion'
import stampSuggestionOverride from './overrides/stampSuggestion'

const useSuggester = (...input: Parameters<typeof useWordSuggester>) => {
  return toOverridable(useWordSuggester(...input))
    .overrides(channelSuggestionOverride)
    .overrides(stampSuggestionOverride)
}

export default useSuggester
