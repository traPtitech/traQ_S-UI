import { toOverridable } from '/@/lib/suggestion/applier'
import useWordSuggester from './useWordSuggester'
import channelSuggestionOverride from './overrides/channelSuggestion'

const useSuggester = (...input: Parameters<typeof useWordSuggester>) => {
  return toOverridable(useWordSuggester(...input)).overrides(
    channelSuggestionOverride
  ) // .overrides(...).overrides(...) ...
}

export default useSuggester
