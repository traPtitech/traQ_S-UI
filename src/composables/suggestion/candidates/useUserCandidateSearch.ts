import { createSharedComposable } from '@vueuse/core'

import useUserList from '/@/composables/users/useUserList'

import useCandidateSearch from './useCandidateSearch'

const useUserCandidateSearch = createSharedComposable(() => {
  const userList = useUserList()

  return useCandidateSearch(() =>
    userList.value.map(user => ({
      type: 'user',
      text: `@${user.name}`,
      id: user.id
    }))
  )
})

export default useUserCandidateSearch
