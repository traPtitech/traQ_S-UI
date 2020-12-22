import { defineMutations } from 'direct-vuex'
import { UserId } from '@/types/entity-ids'
import { UserDetail } from '@traptitech/traq'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setUserDetail: (state, userDetail: UserDetail) => {
    state.userDetails[userDetail.id] = userDetail
  },
  deleteUserDetail: (state, userId: UserId) => {
    delete state.userDetails[userId]
  }
})
