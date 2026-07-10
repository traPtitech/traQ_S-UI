import { toOverridable } from '/@/lib/suggestion/applier'

import channelSuggestionOverride from './overrides/channelSuggestion'
import insertSpaceOverride from './overrides/insertSpace'
import stampSuggestionOverride from './overrides/stampSuggestion'
import useWordSuggester from './useWordSuggester'

const useSuggester = (...input: Parameters<typeof useWordSuggester>) => {
  return toOverridable(useWordSuggester(...input))
    .overrides(insertSpaceOverride)
    .overrides(channelSuggestionOverride)
    .overrides(stampSuggestionOverride)
}

export default useSuggester
