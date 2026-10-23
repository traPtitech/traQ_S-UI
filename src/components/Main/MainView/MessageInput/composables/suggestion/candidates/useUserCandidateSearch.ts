import useUserList from '/@/composables/users/useUserList'

import useCandidateSearch from './useCandidateSearch'

const useUserCandidateSearch = () => {
  const userList = useUserList()
  return useCandidateSearch(
    () =>
      userList.value.map(user => ({
        type: 'user',
        text: `@${user.name}`,
        id: user.id
      })),
    ['setUser', 'setUsers', 'deleteUser']
  )
}

export default useUserCandidateSearch
