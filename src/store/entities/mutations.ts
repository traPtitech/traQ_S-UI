import { UserGroupId, UserId } from '@/types/entity-ids'
import { User, UserGroup } from '@traptitech/traq'
import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setUser(state: S, user: User) {
    state.usersMap.set(user.id, user)
  },
  setUsersMap(state: S, usersMap: Map<UserId, User>) {
    state.usersMap = usersMap
    state.usersMapFetched = true
  },
  deleteUser(state: S, userId: UserId) {
    state.usersMap.delete(userId)
  },

  setUserGroup(state: S, userGroup: UserGroup) {
    state.userGroupsMap.set(userGroup.id, userGroup)
  },
  setUserGroupsMap(state: S, userGroupsMap: Map<UserGroupId, UserGroup>) {
    state.userGroupsMap = userGroupsMap
    state.userGroupsMapFetched = true
  },
  deleteUserGroup(state: S, userGroupId: UserGroupId) {
    state.userGroupsMap.delete(userGroupId)
  }
})
