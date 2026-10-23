import { animeEffectSet, sizeEffectSet } from '/@/lib/markdown/effects'

import useCandidateSearch from './useCandidateSearch'

const useStampEffectCandidateSearch = () => {
  return useCandidateSearch(
    () =>
      [...animeEffectSet, ...sizeEffectSet].map(effectName => ({
        type: 'stamp-effect',
        text: `.${effectName}`
      })),
    []
  )
}

export default useStampEffectCandidateSearch
