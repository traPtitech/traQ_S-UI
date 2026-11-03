import { createSharedComposable } from '@vueuse/core'

import { useGroupsStore } from '/@/store/entities/groups'

import useCandidateSearch from './useCandidateSearch'

const useUserGroupCandidateSearch = createSharedComposable(() => {
  const { userGroupsMap } = useGroupsStore()

  return useCandidateSearch(() =>
    [...userGroupsMap.value.values()].map(group => ({
      type: 'user-group',
      text: `@${group.name}`,
      id: group.id
    }))
  )
})

export default useUserGroupCandidateSearch
