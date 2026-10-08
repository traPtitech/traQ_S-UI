import { useStampsStore } from '/@/store/entities/stamps'

import useCandidateSearch from './useCandidateSearch'

const useStampCandidateSearch = () => {
  const { stampsMap } = useStampsStore()
  return useCandidateSearch(
    () =>
      [...stampsMap.value.values()].map(stamp => ({
        type: 'stamp',
        text: `:${stamp.name}`,
        id: stamp.id
      })),
    ['setStamp', 'setStamps', 'deleteStamp']
  )
}

export default useStampCandidateSearch
