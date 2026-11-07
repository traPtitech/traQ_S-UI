import { createSharedComposable } from '@vueuse/core'

import { animeEffectSet, sizeEffectSet } from '/@/lib/markdown/effects'

import useCandidateSearch from './useCandidateSearch'

const useStampEffectCandidateSearch = createSharedComposable(() => {
  return useCandidateSearch(() =>
    [...animeEffectSet, ...sizeEffectSet].map(effectName => ({
      type: 'stamp-effect',
      text: `.${effectName}`
    }))
  )
})

export default useStampEffectCandidateSearch
