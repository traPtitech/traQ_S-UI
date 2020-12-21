import { defineMutations } from 'direct-vuex'
import { UserId } from '@/types/entity-ids'
import { UserDetail } from '@traptitech/traq'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setOnlineUsers(state: S, users: UserId[]) {
    state.onlineUsers = users
  },
  addOnlineUser(state: S, userId: UserId) {
    state.onlineUsers.push(userId)
  },
  deleteOnlineUser(state: S, userId: UserId) {
    state.onlineUsers.splice(state.onlineUsers.indexOf(userId), 1)
  },
  setUserDetail: (state, userDetail: UserDetail) => {
    state.userDetails[userDetail.id] = userDetail
  },
  deleteUserDetail: (state, userId: UserId) => {
    delete state.userDetails[userId]
  }
})
