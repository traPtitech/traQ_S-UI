import { UserGroupId, UserId } from '@/types/entity-ids'
import { User, UserGroup } from '@traptitech/traq'

export type S = {
  usersMap: Map<UserId, User>
  usersMapFetched: boolean
  userGroupsMap: Map<UserGroupId, UserGroup>
  userGroupsMapFetched: boolean
}

export const state: S = {
  usersMap: new Map(),
  usersMapFetched: false,
  userGroupsMap: new Map(),
  userGroupsMapFetched: false
}
