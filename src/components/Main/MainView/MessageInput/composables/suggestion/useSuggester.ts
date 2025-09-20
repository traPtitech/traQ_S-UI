import useWordSuggester from './useWordSuggester'
import channelSuggestionOverride from './overrides/channelSuggestion'
import { toOverridable } from './overrides/applier'

const useSuggester = (...input: Parameters<typeof useWordSuggester>) => {
  return toOverridable(useWordSuggester(...input)).overrides(
    channelSuggestionOverride
  ) // .overrides(...).overrides(...) ...
}

export default useSuggester
