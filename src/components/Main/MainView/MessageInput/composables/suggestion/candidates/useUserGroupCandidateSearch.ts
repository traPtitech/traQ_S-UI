import { useGroupsStore } from '/@/store/entities/groups'

import useCandidateSearch from './useCandidateSearch'

const useUserGroupCandidateSearch = () => {
  const { userGroupsMap } = useGroupsStore()
  return useCandidateSearch(
    () =>
      [...userGroupsMap.value.values()].map(group => ({
        type: 'user-group',
        text: `@${group.name}`,
        id: group.id
      })),
    ['setUserGroup', 'setUserGroups', 'deleteUserGroup']
  )
}

export default useUserGroupCandidateSearch
