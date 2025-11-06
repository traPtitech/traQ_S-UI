import { toOverridable } from '/@/lib/suggestion/applier'

import channelSuggestionOverride from './overrides/channelSuggestion'
import stampSuggestionOverride from './overrides/stampSuggestion'
import useWordSuggester from './useWordSuggester'

const useSuggester = (...input: Parameters<typeof useWordSuggester>) => {
  return toOverridable(useWordSuggester(...input))
    .overrides(channelSuggestionOverride)
    .overrides(stampSuggestionOverride)
}

export default useSuggester
