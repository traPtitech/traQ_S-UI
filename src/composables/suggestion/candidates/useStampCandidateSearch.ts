import { createSharedComposable } from '@vueuse/core'

import { useStampsStore } from '/@/store/entities/stamps'

import useCandidateSearch from './useCandidateSearch'

const useStampCandidateSearch = createSharedComposable(() => {
  const { stampsMap } = useStampsStore()

  return useCandidateSearch(() =>
    [...stampsMap.value.values()].map(stamp => ({
      type: 'stamp',
      text: `:${stamp.name}`,
      id: stamp.id
    }))
  )
})

export default useStampCandidateSearch
