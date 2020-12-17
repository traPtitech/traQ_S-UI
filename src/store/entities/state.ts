import { UserId } from '@/types/entity-ids'
import { User } from '@traptitech/traq'

export type S = {
  usersMap: Map<UserId, User>
  usersMapFetched: boolean
}

export const state: S = {
  usersMap: new Map(),
  usersMapFetched: false
}
