import { UserId } from '/@/types/entity-ids'
import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setOnlineUsers(state: S, users: Set<UserId>) {
    state.onlineUsers = users
    state.onlineUsersFetched = true
  },
  addOnlineUser(state: S, userId: UserId) {
    state.onlineUsers.add(userId)
  },
  deleteOnlineUser(state: S, userId: UserId) {
    state.onlineUsers.delete(userId)
  }
})
