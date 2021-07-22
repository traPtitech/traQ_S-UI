import { UserId } from '/@/types/entity-ids'

export type S = {
  onlineUsers: Set<UserId>
  onlineUsersFetched: boolean
}

export const state: S = {
  onlineUsers: new Set(),
  onlineUsersFetched: false
}
